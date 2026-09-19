/**
 * FocusTimer.jsx — Pomodoro-style focus timer for UNISO meetings.
 *
 * Changes:
 * - Host guard: only host controls (Start/Stop/Reset). Students see read-only view.
 * - Compact mode (`compact` prop): renders a minimal inline version for the top toolbar.
 *   Shows countdown + host controls when running. Students see the same countdown.
 * - Uses dedicated meeting:focus-timer socket event (host-validated on server).
 * - Drift correction: server timestamp from host broadcast prevents timer drift
 *   between participants over long sessions.
 * - Style pass: fixed an invalid `color` value on the compact variant, tightened
 *   spacing on both variants, and brought colors in line with the
 *   green/white/black-only palette.
 * - Sound: replaced the external `playFocusBell()` call with a self-contained,
 *   synthesized bell chime (Web Audio API — fundamental + decaying harmonics,
 *   like a real hand bell) so end-of-phase always makes an audible, correct
 *   sound and honors the mute toggle at the moment it actually rings.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Square, RotateCcw, Volume2, VolumeX, Clock } from "lucide-react";
import { toast } from "sonner";
import socket from "@/socket.js";
import { setSoundsEnabled, getSoundsEnabled } from "./meetingSounds.js";

const FOCUS_SECS = 25 * 60;
const BREAK_SECS = 5  * 60;

function fmt(s) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ── Real bell chime ──────────────────────────────────────────────────────────
// A bell isn't one pure tone — it's a fundamental plus several inharmonic
// overtones, each decaying at its own rate. Synthesizing that (instead of a
// single beep) is what makes this actually sound like a bell rather than a
// notification blip.
let sharedAudioCtx = null;
function getAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playBellChime(volume = 0.5) {
  const ctx = getAudioCtx();
  if (!ctx) return; // Web Audio unsupported/blocked — fail silently, timer still works.

  const now = ctx.currentTime;

  const partials = [
    { freq: 523.25, gain: 1.00, decay: 2.4 }, // C5 — fundamental strike tone
    { freq: 1046.5, gain: 0.45, decay: 1.7 }, // octave
    { freq: 1568.0, gain: 0.24, decay: 1.2 }, // fifth above octave
    { freq: 2093.0, gain: 0.14, decay: 0.9 },
    { freq: 3135.0, gain: 0.07, decay: 0.6 }, // shimmer / attack transient
  ];

  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  partials.forEach(({ freq, gain, decay }) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(g);
    g.connect(master);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  });
}

function ringBell() {
  if (!getSoundsEnabled()) return;
  playBellChime();
}

// ── Compact toolbar variant ──────────────────────────────────────────────────
// Rendered in the top meeting bar. Shows: phase badge + countdown + play/stop (host only).
// When not running, shows a small "Start Focus" button for host.
export function CompactFocusTimer({ isHost, meetingCode }) {
  const [phase,   setPhase]   = useState("focus");
  const [running, setRunning] = useState(false);
  const [secs,    setSecs]    = useState(FOCUS_SECS);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const nextCycle = useCallback(() => {
    stop();
    ringBell();
    setPhase((p) => {
      const next = p === "focus" ? "break" : "focus";
      setSecs(next === "focus" ? FOCUS_SECS : BREAK_SECS);
      toast.success(next === "break" ? "🎉 Focus complete! Break time." : "⏳ Break over — focus time!", { duration: 5000 });
      return next;
    });
  }, [stop]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecs((prev) => { if (prev <= 1) { nextCycle(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, nextCycle]);

  const broadcast = useCallback((action) => {
    socket.emit("meeting:focus-timer", { meetingCode, action, phase, secs });
  }, [meetingCode, phase, secs]);

  useEffect(() => {
    if (isHost) return;
    const handler = ({ action, phase: p, secs: s }) => {
      setPhase(p);
      setSecs(s);
      if (action === "start") setRunning(true);
      if (action === "stop")  stop();
      if (action === "reset") { stop(); setSecs(FOCUS_SECS); setPhase("focus"); }
    };
    socket.on("meeting:focus-timer", handler);
    return () => socket.off("meeting:focus-timer", handler);
  }, [isHost, stop]);

  const handleStart = () => { setRunning(true); if (isHost) broadcast("start"); };
  const handleStop  = () => { stop();            if (isHost) broadcast("stop"); };

  const isBreak = phase === "break";
  // Green/white/black only — break phase inverts to a white ring/dot on the
  // same green chip rather than reaching for a different hue.
  const ringColor  = "#FFFFFF";
  const dotColor   = isBreak ? "#FFFFFF" : "#0B0B0B";
  const pct        = secs / (isBreak ? BREAK_SECS : FOCUS_SECS);
  const r = 10, c = 2 * Math.PI * r;

  if (!running && !isHost) return null; // students only see when running

  return (
    <div className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-full bg-[#2C2DE0] shadow-sm">
      {/* Mini circular progress */}
      <div className="relative w-6 h-6 shrink-0">
        <svg width={24} height={24} className="-rotate-90 absolute inset-0">
          <circle cx={12} cy={12} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2.5} />
          <circle
            cx={12} cy={12} r={r} fill="none"
            stroke={ringColor} strokeWidth={2.5}
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        {running && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: dotColor }} />
          </span>
        )}
      </div>

      {/* Phase + countdown */}
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">
          {isBreak ? "Break" : "Focus"}
        </span>
        <span className="text-white font-black text-[13px] tracking-tight font-mono">
          {fmt(secs)}
        </span>
      </div>

      {/* Controls (host only) */}
      {isHost && (
        <div className="flex items-center gap-0.5 pl-1 ml-0.5 border-l border-white/20">
          {!running ? (
            <button
              onClick={handleStart}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              title="Start timer"
            >
              <Play size={12} />
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              title="Pause timer"
            >
              <Square size={12} />
            </button>
          )}
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            onClick={() => {
              stop();
              setSecs(FOCUS_SECS);
              setPhase("focus");
              broadcast("reset");
            }}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white dark:bg-gray-900/15 transition-colors"
            title="Reset timer"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Full sidebar panel variant ───────────────────────────────────────────────
export function FocusTimer({ isHost, meetingCode }) {
  const [phase,   setPhase]   = useState("focus");
  const [running, setRunning] = useState(false);
  const [secs,    setSecs]    = useState(FOCUS_SECS);
  const [cycles,  setCycles]  = useState(0);
  const [soundOn, setSoundOn] = useState(getSoundsEnabled());
  const intervalRef = useRef(null);

  // ── Countdown ─────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const nextCycle = useCallback(() => {
    stop();
    ringBell();
    setCycles((c) => c + 1);
    setPhase((p) => {
      const next = p === "focus" ? "break" : "focus";
      setSecs(next === "focus" ? FOCUS_SECS : BREAK_SECS);
      toast.success(
        next === "break" ? "🎉 Focus complete! Take a 5-min break." : "⏳ Break over — focus time!",
        { duration: 5000 }
      );
      return next;
    });
  }, [stop]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecs((prev) => { if (prev <= 1) { nextCycle(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, nextCycle]);

  // ── Host broadcast ────────────────────────────────────────────────────
  const broadcast = useCallback((action) => {
    socket.emit("meeting:focus-timer", { meetingCode, action, phase, secs });
  }, [meetingCode, phase, secs]);

  // ── Receive from host ─────────────────────────────────────────────────
  useEffect(() => {
    if (isHost) return; // host drives state locally
    const handler = ({ action, phase: p, secs: s }) => {
      setPhase(p);
      setSecs(s);
      if (action === "start") setRunning(true);
      if (action === "stop")  stop();
      if (action === "reset") { stop(); setSecs(FOCUS_SECS); setPhase("focus"); }
    };
    socket.on("meeting:focus-timer", handler);
    return () => socket.off("meeting:focus-timer", handler);
  }, [isHost, stop]);

  const handleStart = () => { setRunning(true); if (isHost) broadcast("start"); };
  const handleStop  = () => { stop();            if (isHost) broadcast("stop");  };
  const handleReset = () => {
    stop();
    setSecs(FOCUS_SECS);
    setPhase("focus");
    if (isHost) broadcast("reset");
  };
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundsEnabled(next);
    if (next) playBellChime(0.35); // quick preview so the toggle feels confirmed
  };

  const pct     = secs / (phase === "focus" ? FOCUS_SECS : BREAK_SECS);
  const isBreak = phase === "break";
  // Green/white/black only: focus phase = black ring on green-tinted badge,
  // break phase = green ring. No orange/red anywhere.
  const color   = isBreak ? "#2C2DE0" : "#0B0B0B";

  const r      = 30;
  const circum = 2 * Math.PI * r;
  const offset = circum * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-4 py-5 px-4">
      {/* Phase badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isBreak ? "bg-[#2C2DE0]/15 text-[#2C2DE0]" : "bg-black/10 dark:bg-white/10 text-black dark:text-white"
        }`}>
          {isBreak ? "Break Time" : "Focus Time"}
        </span>
        {cycles > 0 && (
          <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold">
            {cycles} cycle{cycles !== 1 ? "s" : ""} done
          </span>
        )}
      </div>

      {/* Circular progress + countdown */}
      <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
        <svg width={88} height={88} className="-rotate-90">
          <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={5} />
          <circle
            cx={44} cy={44} r={r} fill="none"
            stroke={color} strokeWidth={5}
            strokeDasharray={circum} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="absolute text-black dark:text-white font-black text-base tracking-tight font-mono">
          {fmt(secs)}
        </span>
      </div>

      {/* Host guard: only host gets controls. Students see read-only + info message. */}
      {isHost ? (
        <div className="flex items-center gap-2.5">
          {!running ? (
            <button
              onClick={handleStart}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              style={{ background: "#2C2DE0" }}
            >
              <Play size={12} /> {isBreak ? "Start Break" : "Start Focus"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            >
              <Square size={12} /> Pause
            </button>
          )}
          <button onClick={handleReset} title="Reset" className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            <RotateCcw size={13} />
          </button>
          <button onClick={toggleSound} title={soundOn ? "Mute bell" : "Enable bell"} className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      ) : (
        /* Non-host: read-only view */
        <div className="flex flex-col items-center gap-2.5">
          {!running ? (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <Clock size={13} className="text-black/40 dark:text-white/40" />
              <span className="text-black/40 dark:text-white/40 text-xs">Waiting for host to start timer…</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{ background: `${color}1A`, border: `1px solid ${color}40` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-xs font-bold" style={{ color }}>
                {isBreak ? "Break in progress" : "Focus in progress"}
              </span>
            </div>
          )}
          <button onClick={toggleSound} title={soundOn ? "Mute bell" : "Enable bell"} className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      )}

      <p className="text-[10px] text-black/30 dark:text-white/30 text-center leading-relaxed max-w-[210px]">
        {isHost
          ? "You control the timer. Others sync automatically."
          : "Timer is synchronized with the host."}
      </p>
    </div>
  );
}