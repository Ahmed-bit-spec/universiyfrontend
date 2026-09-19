// InteractiveOwlMascot.jsx
// "Lumi" — reactive version of the owl mascot, same green/black/white system.
// Unlike the static OwlMascot, this one changes pose/expression based on a
// `mood` prop so it can react to real user actions (correct/wrong answer,
// streak milestone, level up, etc.) the way Duolingo's owl does.
//
// Moods: "idle" | "happy" | "sad" | "celebrate" | "thinking" | "wave" | "sleepy"
//
// Usage:
//   const [mood, setMood] = useState("idle");
//   <InteractiveOwlMascot mood={mood} message="Nice! +20 XP" />
//   // on correct answer: setMood("happy"); setTimeout(() => setMood("idle"), 1800);
//   // on wrong answer:   setMood("sad");   setTimeout(() => setMood("idle"), 1800);
//   // on streak/level up: setMood("celebrate");
//
// A tiny built-in controller (useOwlReaction) is exported at the bottom so you
// don't have to wire the timeouts yourself in every screen.

import { useEffect, useRef, useState } from "react";

// ─── Mood → pose config ────────────────────────────────────────────────────
// Every mood only changes a handful of small numbers (eye scale/offset, brow
// angle, beak shape, wing angle, bounce) so the rig stays cheap to animate.
const MOODS = {
  idle: {
    eyeScaleY: 1, browAngle: 0, beakOpen: 0,
    wingL: 0, wingR: 0, bodyTilt: 0, bounce: false, sparkle: false,
    cheek: 0, browY: 0,
  },
  happy: {
    eyeScaleY: 0.55, browAngle: -6, beakOpen: 4,
    wingL: -18, wingR: 18, bodyTilt: -2, bounce: true, sparkle: true,
    cheek: 0.5, browY: -1,
  },
  sad: {
    eyeScaleY: 0.8, browAngle: 12, beakOpen: 0,
    wingL: 6, wingR: -6, bodyTilt: 3, bounce: false, sparkle: false,
    cheek: 0, browY: 2, droop: true,
  },
  celebrate: {
    eyeScaleY: 0.35, browAngle: -10, beakOpen: 6,
    wingL: -34, wingR: 34, bodyTilt: 0, bounce: true, sparkle: true,
    cheek: 0.7, browY: -2, confetti: true,
  },
  thinking: {
    eyeScaleY: 1, browAngle: -4, beakOpen: 1,
    wingL: 0, wingR: 10, bodyTilt: -4, bounce: false, sparkle: false,
    cheek: 0, browY: -1, lookUp: true,
  },
  wave: {
    eyeScaleY: 0.7, browAngle: -4, beakOpen: 2,
    wingL: 0, wingR: -28, bodyTilt: -3, bounce: false, sparkle: false,
    cheek: 0.3, browY: 0, waveWing: true,
  },
  sleepy: {
    eyeScaleY: 0.08, browAngle: 4, beakOpen: 0,
    wingL: 2, wingR: -2, bodyTilt: 4, bounce: false, sparkle: false,
    cheek: 0, browY: 2,
  },
};

// ─── Speech bubble ──────────────────────────────────────────────────────────
const SpeechBubble = ({ message, mood }) => {
  if (!message) return null;
  const color = mood === "sad" ? "#6B7280" : "#2C2DE0";
  return (
    <div
      className="owl-speech-pop"
      style={{
        position: "absolute",
        top: "-6px",
        left: "50%",
        transform: "translate(-50%, -100%)",
        background: "#fff",
        border: `1.5px solid ${mood === "sad" ? "#e5e7eb" : "rgba(88,204,2,0.4)"}`,
        borderRadius: "14px",
        padding: "8px 14px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
        whiteSpace: "nowrap",
        fontSize: "13px",
        fontWeight: 700,
        color,
        zIndex: 5,
      }}
    >
      {message}
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: "10px",
          height: "10px",
          background: "#fff",
          borderRight: `1.5px solid ${mood === "sad" ? "#e5e7eb" : "rgba(88,204,2,0.4)"}`,
          borderBottom: `1.5px solid ${mood === "sad" ? "#e5e7eb" : "rgba(88,204,2,0.4)"}`,
        }}
      />
    </div>
  );
};

// ─── Confetti burst (celebrate mood only) ──────────────────────────────────
const Confetti = () => {
  const pieces = Array.from({ length: 10 });
  const colors = ["#2C2DE0", "#2C2DE0", "#EEF2FF", "#14171A"];
  return (
    <>
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i;
        const dist = 70 + (i % 3) * 18;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <span
            key={i}
            className="owl-confetti-piece"
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              width: "6px",
              height: "6px",
              borderRadius: i % 2 ? "50%" : "2px",
              background: colors[i % colors.length],
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animationDelay: `${i * 0.02}s`,
            }}
          />
        );
      })}
    </>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────
export const InteractiveOwlMascot = ({
  size = 220,
  mood = "idle",
  message = null,
  onClick = null,
}) => {
  const m = MOODS[mood] ?? MOODS.idle;

  return (
    <div
      className={`owl-int-wrap ${m.bounce ? "owl-bounce" : ""} ${onClick ? "owl-clickable" : ""}`}
      style={{ width: size, position: "relative" }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <InteractiveOwlStyles />
      <SpeechBubble message={message} mood={mood} />
      {m.confetti && <Confetti />}

      {/* soft halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(88,204,2,0.28) 0%, rgba(88,204,2,0.08) 55%, transparent 75%)",
          filter: "blur(6px)",
          zIndex: 0,
        }}
      />

      <svg
        viewBox="0 0 200 220"
        width="100%"
        style={{
          position: "relative",
          zIndex: 1,
          display: "block",
          transform: `rotate(${m.bodyTilt}deg)`,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <defs>
          <radialGradient id="lumiBody2" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#2A2E31" />
            <stop offset="55%" stopColor="#1C1F21" />
            <stop offset="100%" stopColor="#0E0F10" />
          </radialGradient>
          <radialGradient id="lumiBelly2" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </radialGradient>
        </defs>

        {/* contact shadow — squashes slightly on bounce */}
        <ellipse className="owl-shadow" cx="100" cy="208" rx="46" ry="8" fill="#000" opacity="0.15" />

        {/* left wing */}
        <path
          d="M46 108 Q18 118 16 158 Q34 150 48 132 Z"
          fill="#14171A"
          style={{
            transformOrigin: "46px 108px",
            transform: `rotate(${m.wingL}deg)`,
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        {/* right wing — waves back and forth in "wave" mood */}
        <path
          className={m.waveWing ? "owl-wave-wing" : ""}
          d="M154 108 Q182 118 184 158 Q166 150 152 132 Z"
          fill="#14171A"
          style={{
            transformOrigin: "154px 108px",
            transform: m.waveWing ? undefined : `rotate(${m.wingR}deg)`,
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />

        {/* ear tufts — droop a little when sad */}
        <path
          d={m.droop ? "M62 46 L54 14 L80 36 Z" : "M62 42 L52 8 L82 34 Z"}
          fill="#1C1F21"
          style={{ transition: "d 0.3s ease" }}
        />
        <path
          d={m.droop ? "M138 46 L146 14 L120 36 Z" : "M138 42 L148 8 L118 34 Z"}
          fill="#1C1F21"
          style={{ transition: "d 0.3s ease" }}
        />

        {/* body */}
        <ellipse cx="100" cy="120" rx="58" ry="66" fill="url(#lumiBody2)" />
        {/* belly */}
        <ellipse cx="100" cy="132" rx="38" ry="48" fill="url(#lumiBelly2)" />

        {/* belly flecks */}
        <g opacity="0.35" stroke="#9AD97A" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M86 108 q4 6 0 12" />
          <path d="M100 112 q4 6 0 12" />
          <path d="M114 108 q4 6 0 12" />
          <path d="M93 132 q4 6 0 12" />
          <path d="M107 132 q4 6 0 12" />
        </g>

        {/* face disc */}
        <circle cx="100" cy="86" r="44" fill="#FFFFFF" opacity="0.95" />

        {/* brows — the main expressive element */}
        <path
          d="M68 66 q12 -8 24 -2"
          stroke="#14171A" strokeWidth="3.5" fill="none" strokeLinecap="round"
          style={{
            transform: `rotate(${m.browAngle}deg) translateY(${m.browY}px)`,
            transformOrigin: "80px 64px",
            transition: "transform 0.3s ease",
          }}
        />
        <path
          d="M132 66 q-12 -8 -24 -2"
          stroke="#14171A" strokeWidth="3.5" fill="none" strokeLinecap="round"
          style={{
            transform: `rotate(${-m.browAngle}deg) translateY(${m.browY}px)`,
            transformOrigin: "120px 64px",
            transition: "transform 0.3s ease",
          }}
        />

        {/* eyes (glasses-like rings) */}
        <circle cx="80" cy={m.lookUp ? 83 : 86} r="17" fill="#14171A" />
        <circle cx="120" cy={m.lookUp ? 83 : 86} r="17" fill="#14171A" />
        <circle cx="80" cy="86" r="17" fill="none" stroke="#2C2DE0" strokeWidth="2.5" />
        <circle cx="120" cy="86" r="17" fill="none" stroke="#2C2DE0" strokeWidth="2.5" />
        <circle
          cx="80" cy={m.lookUp ? 83 : 86} r="8.5" fill="#EEF2FF"
          style={{
            transform: `scaleY(${m.eyeScaleY})`,
            transformOrigin: `80px ${m.lookUp ? 83 : 86}px`,
            transition: "transform 0.25s ease",
          }}
        />
        <circle
          cx="120" cy={m.lookUp ? 83 : 86} r="8.5" fill="#EEF2FF"
          style={{
            transform: `scaleY(${m.eyeScaleY})`,
            transformOrigin: `120px ${m.lookUp ? 83 : 86}px`,
            transition: "transform 0.25s ease",
          }}
        />
        <circle cx="83" cy={m.lookUp ? 80.5 : 83} r="2.6" fill="#14171A" />
        <circle cx="123" cy={m.lookUp ? 80.5 : 83} r="2.6" fill="#14171A" />
        <circle cx="80" cy={m.lookUp ? 83 : 86} r="1.4" fill="#fff" />
        <circle cx="120" cy={m.lookUp ? 83 : 86} r="1.4" fill="#fff" />

        {/* cheeks — flush pink-green when happy/celebrating */}
        <circle cx="58" cy="98" r="7" fill="#2C2DE0" opacity={m.cheek} style={{ transition: "opacity 0.3s ease" }} />
        <circle cx="142" cy="98" r="7" fill="#2C2DE0" opacity={m.cheek} style={{ transition: "opacity 0.3s ease" }} />

        {/* beak — opens for happy/celebrate/wave */}
        <path
          d={
            m.beakOpen
              ? `M95 100 L105 100 L102 ${110 + m.beakOpen} L98 ${110 + m.beakOpen} Z`
              : "M96 100 L104 100 L100 110 Z"
          }
          fill="#2C2DE0"
          style={{ transition: "d 0.25s ease" }}
        />

        {/* feet */}
        <path d="M84 184 v10 M84 194 l-6 5 M84 194 l6 5" stroke="#14171A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M116 184 v10 M116 194 l-6 5 M116 194 l6 5" stroke="#14171A" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* sparkles when happy/celebrating */}
        {m.sparkle && (
          <g className="owl-sparkles" fill="#2C2DE0">
            <path d="M40 60 l2.4 6.2 6.2 2.4 -6.2 2.4 -2.4 6.2 -2.4 -6.2 -6.2 -2.4 6.2 -2.4 Z" />
            <path d="M164 52 l2 5.2 5.2 2 -5.2 2 -2 5.2 -2 -5.2 -5.2 -2 5.2 -2 Z" opacity="0.85" />
          </g>
        )}
      </svg>
    </div>
  );
};

const InteractiveOwlStyles = () => (
  <style>{`
    .owl-int-wrap { transition: transform 0.15s ease; }
    .owl-clickable { cursor: pointer; }
    .owl-clickable:active { transform: scale(0.96); }

    .owl-bounce { animation: owlBounce 0.55s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes owlBounce {
      0%   { transform: translateY(0) scale(1); }
      30%  { transform: translateY(-16px) scale(1.04, 0.96); }
      55%  { transform: translateY(2px) scale(0.97, 1.04); }
      75%  { transform: translateY(-4px) scale(1.01); }
      100% { transform: translateY(0) scale(1); }
    }

    .owl-shadow { transform-origin: 100px 208px; }
    .owl-bounce .owl-shadow { animation: owlShadowPulse 0.55s ease; }
    @keyframes owlShadowPulse {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      30%      { transform: scale(0.7); opacity: 0.08; }
    }

    .owl-sparkles { animation: owlSparkle 1.1s ease-in-out infinite; transform-origin: center; }
    @keyframes owlSparkle {
      0%, 100% { opacity: 0.4; transform: scale(0.85) rotate(0deg); }
      50%      { opacity: 1;   transform: scale(1.15) rotate(8deg); }
    }

    .owl-wave-wing { animation: owlWave 0.5s ease-in-out 3; transform-origin: 154px 108px; }
    @keyframes owlWave {
      0%, 100% { transform: rotate(-10deg); }
      50%      { transform: rotate(-40deg); }
    }

    .owl-speech-pop { animation: owlSpeechPop 0.25s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes owlSpeechPop {
      0%   { opacity: 0; transform: translate(-50%, -90%) scale(0.85); }
      100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
    }

    .owl-confetti-piece {
      animation: owlConfetti 0.9s ease-out forwards;
    }
    @keyframes owlConfetti {
      0%   { transform: translate(0, 0) scale(1);   opacity: 1; }
      100% { transform: translate(var(--dx), calc(var(--dy) + 40px)) scale(0.4); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .owl-bounce, .owl-sparkles, .owl-wave-wing, .owl-speech-pop, .owl-confetti-piece {
        animation: none !important;
      }
    }
  `}</style>
);

// ─── Optional controller hook ────────────────────────────────────────────────
// Wraps the common "flash a mood, then return to idle" pattern used for quiz
// feedback, XP gains, streaks, etc. so screens don't each re-implement timers.
//
//   const { mood, message, react } = useOwlReaction();
//   react("happy", "Nice! +20 XP");     // on correct answer
//   react("sad", "Not quite — try again"); // on wrong answer
//   react("celebrate", "🔥 7 day streak!"); // on streak milestone
export const useOwlReaction = (resetDelay = 1800) => {
  const [mood, setMood] = useState("idle");
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const react = (nextMood, nextMessage = null, holdMs = resetDelay) => {
    clearTimeout(timerRef.current);
    setMood(nextMood);
    setMessage(nextMessage);
    timerRef.current = setTimeout(() => {
      setMood("idle");
      setMessage(null);
    }, holdMs);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { mood, message, react, setMood, setMessage };
};

export default InteractiveOwlMascot;