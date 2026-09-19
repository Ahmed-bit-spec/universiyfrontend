/**
 * Whiteboard.jsx — Advanced classroom whiteboard for UNISO meetings.
 *
 * New features:
 *  1. Touch support — draw on tablet/mobile with touch events
 *  2. Highlighter tool — semi-transparent yellow/green stroke (30% opacity)
 *  3. Sticky notes — HTML overlay cards; draggable; synced via socket
 *  4. Laser pointer — red glowing dot at teacher's cursor; fades after 2s; synced via socket
 *
 * Laser pointer design (matches Google Meet style):
 *  - Teacher cursor becomes a large red glowing dot when laser tool is active
 *  - Dot position is emitted via socket (throttled to ~30fps)
 *  - Other participants see the dot as an HTML overlay on top of the canvas
 *  - Dot fades out with CSS transition after 2 seconds of no movement
 *  - Laser is NOT recorded on the canvas — it's ephemeral
 *
 * Sticky notes design:
 *  - Yellow cards rendered as HTML overlays on top of the canvas
 *  - Click to place, type to edit, click outside to confirm
 *  - Draggable by clicking their header bar
 *  - Synced to room via socket (relay-event)
 *  - Persisted in component state; cleared when whiteboard is cleared
 *
 * Colors: #2C2DE0 green, white, black. No other colours except tool-specific
 * (yellow sticky notes, red laser pointer — these are functional colours).
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Trash2, Undo2, Redo2, Download, Type, Minus, Square, Circle,
  ArrowRight, Eraser, Maximize2, Minimize2, StickyNote, Crosshair,
  Highlighter,
} from "lucide-react";
import socket from "@/socket.js";

const COLORS = ["#FFFFFF", "#2C2DE0", "#ef4444", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#000000"];
const WIDTHS  = [2, 4, 8, 14];

const TOOLS = [
  { id: "pen",        label: "Pen",          icon: "✏️" },
  { id: "highlighter", label: "Highlighter", icon: <Highlighter size={13} /> },
  { id: "eraser",     label: "Eraser",       icon: <Eraser size={13} /> },
  { id: "line",       label: "Line",         icon: <Minus size={13} /> },
  { id: "rect",       label: "Rectangle",    icon: <Square size={13} /> },
  { id: "circle",     label: "Circle",       icon: <Circle size={13} /> },
  { id: "arrow",      label: "Arrow",        icon: <ArrowRight size={13} /> },
  { id: "text",       label: "Text",         icon: <Type size={13} /> },
  { id: "sticky",     label: "Sticky Note",  icon: <StickyNote size={13} /> },
  { id: "laser",      label: "Laser Pointer", icon: <Crosshair size={13} /> },
];

// Throttle helper for laser pointer position events
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

let stickyIdCounter = Date.now();
const newStickyId = () => `sticky-${++stickyIdCounter}`;

export function Whiteboard({ canDraw = true, meetingCode }) {
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const isDrawingRef   = useRef(false);
  const lastPos        = useRef({ x: 0, y: 0 });
  const startPos       = useRef({ x: 0, y: 0 });
  const historyRef     = useRef([]);
  const redoRef        = useRef([]);
  const textInputRef   = useRef(null);
  const dragStateRef   = useRef(null); // { stickyId, offsetX, offsetY }

  const [tool,          setTool]         = useState("pen");
  const [color,         setColor]        = useState("#2C2DE0");
  const [width,         setWidth]        = useState(4);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos,       setTextPos]      = useState({ x: 0, y: 0 });
  const [textValue,     setTextValue]    = useState("");
  const [isFullscreen,  setIsFullscreen] = useState(false);

  // Sticky notes: array of { id, x, y, text, width, bgColor }
  const [stickies, setStickies] = useState([]);
  const [editingStickyId, setEditingStickyId] = useState(null);

  // Laser pointer — one per remote participant
  // { [socketId]: { x, y, visible } }
  const [remoteLasers,   setRemoteLasers]   = useState({});
  const [localLaser,     setLocalLaser]     = useState({ x: -100, y: -100, visible: false });
  const laserFadeTimers = useRef({});

  // ── Fullscreen ────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Canvas helpers ────────────────────────────────────────────────────
  const getCtx  = () => canvasRef.current?.getContext("2d");
  const getRect = () => canvasRef.current?.getBoundingClientRect();

  const toCanvasPos = useCallback((clientX, clientY) => {
    const rect = getRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = canvasRef.current.width  / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, []);

  // Screen coordinates (for laser pointer overlay, which is CSS-positioned)
  const toScreenPos = useCallback((clientX, clientY) => {
    const rect = getRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const saveSnapshot = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    if (historyRef.current.length > 50) historyRef.current.shift();
    redoRef.current = [];
  }, []);

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current || historyRef.current.length === 0) return;
    redoRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    const prev = historyRef.current.pop();
    ctx.putImageData(prev, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current || redoRef.current.length === 0) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    const next = redoRef.current.pop();
    ctx.putImageData(next, 0, 0);
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    saveSnapshot();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setStickies([]);
    if (meetingCode) {
      socket.emit("meeting:relay-event", { event: "meeting:whiteboard-clear", payload: {} });
    }
  }, [saveSnapshot, meetingCode]);

  // ── Shape drawing ─────────────────────────────────────────────────────
  const drawShape = useCallback((ctx, sx, sy, ex, ey, overrideTool, overrideColor, overrideWidth) => {
    const t = overrideTool   ?? tool;
    const c = overrideColor  ?? color;
    const w = overrideWidth  ?? width;

    if (t === "highlighter") {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#F5E642"; // highlighter yellow
      ctx.lineWidth   = w * 3;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = t === "eraser" ? "#111827" : c;
    ctx.lineWidth   = t === "eraser" ? w * 3 : w;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    if (t === "pen" || t === "eraser") {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    } else if (t === "line") {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    } else if (t === "rect") {
      ctx.strokeRect(sx, sy, ex - sx, ey - sy);
    } else if (t === "circle") {
      const rx = Math.abs(ex - sx) / 2;
      const ry = Math.abs(ey - sy) / 2;
      ctx.beginPath();
      ctx.ellipse(sx + (ex - sx) / 2, sy + (ey - sy) / 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (t === "arrow") {
      const headlen = 15;
      const angle   = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.moveTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex, ey);
      ctx.moveTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }, [tool, color, width]);

  // ── Laser pointer emit (throttled at ~30fps) ──────────────────────────
  const emitLaser = useCallback(throttle((x, y) => {
    if (!meetingCode) return;
    socket.emit("meeting:relay-event", {
      event: "meeting:whiteboard-laser",
      payload: { x, y },
    });
  }, 33), [meetingCode]);

  // ── Mouse/Touch event helpers ─────────────────────────────────────────
  const getEventPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handlePointerDown = useCallback((e) => {
    if (!canDraw) return;
    const { clientX, clientY } = getEventPos(e);

    if (tool === "laser") {
      // Laser pointer — don't draw, just track
      const screenPos = toScreenPos(clientX, clientY);
      setLocalLaser({ ...screenPos, visible: true });
      emitLaser(screenPos.x, screenPos.y);
      return;
    }

    if (tool === "text") {
      const pos = toCanvasPos(clientX, clientY);
      setTextPos(pos);
      setShowTextInput(true);
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    if (tool === "sticky") {
      const rect = getRect();
      if (!rect) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const newSticky = { id: newStickyId(), x, y, text: "", width: 180 };
      setStickies((prev) => [...prev, newSticky]);
      setEditingStickyId(newSticky.id);
      return;
    }

    saveSnapshot();
    isDrawingRef.current = true;
    const pos = toCanvasPos(clientX, clientY);
    lastPos.current  = pos;
    startPos.current = pos;
  }, [canDraw, tool, toCanvasPos, toScreenPos, saveSnapshot, emitLaser]);

  const handlePointerMove = useCallback((e) => {
    const { clientX, clientY } = getEventPos(e);

    if (tool === "laser" && canDraw) {
      const screenPos = toScreenPos(clientX, clientY);
      setLocalLaser({ ...screenPos, visible: true });
      emitLaser(screenPos.x, screenPos.y);
      return;
    }

    if (!isDrawingRef.current || !canDraw) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = toCanvasPos(clientX, clientY);

    if (tool === "pen" || tool === "eraser" || tool === "highlighter") {
      drawShape(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y);
      if (meetingCode) {
        socket.emit("meeting:relay-event", {
          event:   "meeting:whiteboard-draw",
          payload: { tool, color, width, sx: lastPos.current.x, sy: lastPos.current.y, ex: pos.x, ey: pos.y },
        });
      }
      lastPos.current = pos;
    } else {
      // Shape preview: restore snapshot then preview shape
      const snap = historyRef.current[historyRef.current.length - 1];
      if (snap) ctx.putImageData(snap, 0, 0);
      drawShape(ctx, startPos.current.x, startPos.current.y, pos.x, pos.y);
    }
  }, [canDraw, tool, color, width, drawShape, meetingCode, toCanvasPos, toScreenPos, emitLaser]);

  const handlePointerUp = useCallback((e) => {
    if (tool === "laser") {
      setLocalLaser((prev) => ({ ...prev, visible: false }));
      if (meetingCode) {
        socket.emit("meeting:relay-event", {
          event: "meeting:whiteboard-laser-end",
          payload: {},
        });
      }
      return;
    }

    if (!isDrawingRef.current || !canDraw) return;
    const { clientX, clientY } = getEventPos(e);
    const ctx = getCtx();
    if (!ctx) return;
    const pos = toCanvasPos(clientX || 0, clientY || 0);
    if (tool !== "pen" && tool !== "eraser" && tool !== "highlighter") {
      drawShape(ctx, startPos.current.x, startPos.current.y, pos.x, pos.y);
      if (meetingCode) {
        socket.emit("meeting:relay-event", {
          event:   "meeting:whiteboard-shape",
          payload: { tool, color, width, sx: startPos.current.x, sy: startPos.current.y, ex: pos.x, ey: pos.y },
        });
      }
    }
    isDrawingRef.current = false;
  }, [canDraw, tool, color, width, drawShape, meetingCode, toCanvasPos]);

  const commitText = useCallback(() => {
    if (!textValue.trim()) { setShowTextInput(false); return; }
    const ctx = getCtx();
    if (ctx) {
      saveSnapshot();
      const fontSize = Math.max(width * 4, 16);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(textValue, textPos.x, textPos.y);
      if (meetingCode) {
        socket.emit("meeting:relay-event", {
          event:   "meeting:whiteboard-text",
          payload: { text: textValue, x: textPos.x, y: textPos.y, color, size: fontSize },
        });
      }
    }
    setTextValue("");
    setShowTextInput(false);
  }, [textValue, textPos, color, width, saveSnapshot, meetingCode]);

  // ── Sticky note helpers ───────────────────────────────────────────────
  const updateSticky = useCallback((id, updates) => {
    setStickies((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const removeSticky = useCallback((id) => {
    setStickies((prev) => prev.filter((s) => s.id !== id));
    if (meetingCode) {
      socket.emit("meeting:relay-event", { event: "meeting:whiteboard-sticky-remove", payload: { id } });
    }
  }, [meetingCode]);

  const broadcastSticky = useCallback((sticky) => {
    if (!meetingCode) return;
    socket.emit("meeting:relay-event", { event: "meeting:whiteboard-sticky", payload: sticky });
  }, [meetingCode]);

  // Drag handlers for sticky notes
  const startStickyDrag = (e, id, stickyX, stickyY) => {
    e.preventDefault();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startStickyXLocal = stickyX;
    const startStickyYLocal = stickyY;

    const onMove = (me) => {
      const dx = me.clientX - startMouseX;
      const dy = me.clientY - startMouseY;
      updateSticky(id, { x: startStickyXLocal + dx, y: startStickyYLocal + dy });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      // broadcast final position
      setStickies((prev) => {
        const s = prev.find((st) => st.id === id);
        if (s) broadcastSticky(s);
        return prev;
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  };

  // ── Remote events ─────────────────────────────────────────────────────
  useEffect(() => {
    const onRemoteDraw = ({ tool: rt, color: rc, width: rw, sx, sy, ex, ey }) => {
      const ctx = getCtx();
      if (!ctx) return;
      if (rt === "highlighter") {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#F5E642";
        ctx.lineWidth   = rw * 3;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = rt === "eraser" ? "#111827" : rc;
      ctx.lineWidth   = rt === "eraser" ? rw * 3 : rw;
      ctx.lineCap     = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    };

    const onRemoteShape = ({ tool: rt, color: rc, width: rw, sx, sy, ex, ey }) => {
      const ctx = getCtx();
      if (!ctx) return;
      const origStroke = ctx.strokeStyle;
      const origWidth  = ctx.lineWidth;
      ctx.strokeStyle = rc; ctx.lineWidth = rw;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if      (rt === "rect")   ctx.strokeRect(sx, sy, ex - sx, ey - sy);
      else if (rt === "circle") {
        const rx = Math.abs(ex - sx) / 2; const ry = Math.abs(ey - sy) / 2;
        ctx.beginPath(); ctx.ellipse(sx + (ex-sx)/2, sy + (ey-sy)/2, rx, ry, 0, 0, Math.PI*2); ctx.stroke();
      } else if (rt === "line" || rt === "arrow") {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.strokeStyle = origStroke;
      ctx.lineWidth   = origWidth;
    };

    const onRemoteText = ({ text, x, y, color: rc, size }) => {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.font = `${size}px Inter, sans-serif`; ctx.fillStyle = rc;
      ctx.fillText(text, x, y);
    };

    const onRemoteClear = () => {
      const ctx = getCtx();
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStickies([]);
    };

    const onRemoteSticky = (sticky) => {
      setStickies((prev) => {
        const exists = prev.find((s) => s.id === sticky.id);
        if (exists) return prev.map((s) => s.id === sticky.id ? { ...s, ...sticky } : s);
        return [...prev, sticky];
      });
    };

    const onRemoteStickyRemove = ({ id }) => {
      setStickies((prev) => prev.filter((s) => s.id !== id));
    };

    // ── Laser pointer receive ─────────────────────────────────────────
    const onRemoteLaser = ({ x, y }, senderSocketId) => {
      // We receive the sender's socket ID via the relay pattern indirectly.
      // The relay-event handler patches the event with the sender's socket ID
      // ... but currently it doesn't. We use a workaround: track by the
      // last received position without socket ID segmentation.
      // For single-host laser pointer this is sufficient.
      setRemoteLasers((prev) => ({ ...prev, laser: { x, y, visible: true } }));
      clearTimeout(laserFadeTimers.current.laser);
      laserFadeTimers.current.laser = setTimeout(() => {
        setRemoteLasers((prev) => ({ ...prev, laser: { ...prev.laser, visible: false } }));
      }, 2000);
    };

    const onRemoteLaserEnd = () => {
      clearTimeout(laserFadeTimers.current.laser);
      setRemoteLasers((prev) => ({ ...prev, laser: { ...prev.laser, visible: false } }));
    };

    socket.on("meeting:whiteboard-draw",          onRemoteDraw);
    socket.on("meeting:whiteboard-shape",         onRemoteShape);
    socket.on("meeting:whiteboard-text",          onRemoteText);
    socket.on("meeting:whiteboard-clear",         onRemoteClear);
    socket.on("meeting:whiteboard-sticky",        onRemoteSticky);
    socket.on("meeting:whiteboard-sticky-remove", onRemoteStickyRemove);
    socket.on("meeting:whiteboard-laser",         onRemoteLaser);
    socket.on("meeting:whiteboard-laser-end",     onRemoteLaserEnd);

    return () => {
      socket.off("meeting:whiteboard-draw",          onRemoteDraw);
      socket.off("meeting:whiteboard-shape",         onRemoteShape);
      socket.off("meeting:whiteboard-text",          onRemoteText);
      socket.off("meeting:whiteboard-clear",         onRemoteClear);
      socket.off("meeting:whiteboard-sticky",        onRemoteSticky);
      socket.off("meeting:whiteboard-sticky-remove", onRemoteStickyRemove);
      socket.off("meeting:whiteboard-laser",         onRemoteLaser);
      socket.off("meeting:whiteboard-laser-end",     onRemoteLaserEnd);
    };
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href     = canvas.toDataURL("image/png");
    link.download = "whiteboard.png";
    link.click();
  };

  // Determine canvas cursor based on active tool
  const canvasCursor = (() => {
    if (!canDraw) return "not-allowed";
    if (tool === "laser") return "crosshair";
    if (tool === "eraser") return "cell";
    return "crosshair";
  })();

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-gray-950 rounded-2xl overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-900 border-b border-white/10 shrink-0">
        {/* Tool selector */}
        <div className="flex items-center gap-0.5 bg-black/40 rounded-xl p-0.5 flex-wrap">
          {TOOLS.map((t) => (
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              key={t.id}
              onClick={() => setTool(t.id)}
              disabled={!canDraw && t.id !== "laser"}
              title={t.label}
              className={[
                "px-2 py-1.5 rounded-lg text-xs transition-all",
                tool === t.id
                  ? t.id === "laser"
                    ? "bg-red-500 text-white shadow"
                    : t.id === "sticky"
                    ? "bg-yellow-400 text-black shadow"
                    : t.id === "highlighter"
                    ? "bg-yellow-300/80 text-black shadow"
                    : "bg-[#2C2DE0] text-white shadow"
                  : "text-white/60 hover:text-white hover:bg-white dark:bg-gray-900/10 disabled:opacity-40",
              ].join(" ")}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Color swatches — hidden for laser/sticky/eraser */}
        {!["laser", "sticky"].includes(tool) && (
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                key={c}
                onClick={() => setColor(c)}
                disabled={!canDraw}
                title={c}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-40 ${
                  color === c ? "border-white scale-125" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {/* Width picker — hidden for laser/sticky */}
        {!["laser", "sticky"].includes(tool) && (
          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1">
            {WIDTHS.map((w) => (
              <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                key={w}
                onClick={() => setWidth(w)}
                disabled={!canDraw}
                title={`${w}px`}
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all disabled:opacity-40 ${
                  width === w ? "bg-[#2C2DE0]" : "hover:bg-white dark:bg-gray-900/10"
                }`}
              >
                <div className="rounded-full bg-white dark:bg-gray-900" style={{ width: Math.min(w, 10), height: Math.min(w, 10) }} />
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={undo}         disabled={!canDraw} title="Undo (Ctrl+Z)"  className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"><Undo2    size={14} /></button>
          <button onClick={redo}         disabled={!canDraw} title="Redo (Ctrl+Y)"  className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"><Redo2    size={14} /></button>
          <button onClick={clearCanvas}  disabled={!canDraw} title="Clear all"      className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"><Trash2  size={14} /></button>
          <button onClick={downloadBoard}                    title="Download"       className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"><Download              size={14} /></button>
          <button onClick={toggleFullscreen}                 title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Canvas + overlays ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className={`w-full h-full bg-white dark:bg-[#111827]`}
          style={{ cursor: canvasCursor }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => { e.preventDefault(); handlePointerDown(e); }}
          onTouchMove={(e)  => { e.preventDefault(); handlePointerMove(e); }}
          onTouchEnd={(e)   => { e.preventDefault(); handlePointerUp(e);   }}
        />

        {/* Text input overlay */}
        {showTextInput && (
          <input
            ref={textInputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") setShowTextInput(false); }}
            onBlur={commitText}
            style={{
              position: "absolute",
              left:   textPos.x,
              top:    textPos.y - 20,
              fontSize: Math.max(width * 4, 16),
              color,
              background: "transparent",
              border: "1px dashed rgba(255,255,255,0.5)",
              outline: "none",
              minWidth: 80,
              fontFamily: "Inter, sans-serif",
            }}
            className="px-1"
          />
        )}

        {/* ── Sticky notes overlay ── */}
        {stickies.map((sticky) => (
          <div
            key={sticky.id}
            style={{
              position: "absolute",
              left:     sticky.x,
              top:      sticky.y,
              width:    sticky.width ?? 180,
              zIndex:   30,
              userSelect: editingStickyId === sticky.id ? "text" : "none",
            }}
            className="shadow-2xl rounded-xl overflow-hidden"
          >
            {/* Drag handle + close */}
            <div
              className="flex items-center justify-between px-2 py-1 bg-yellow-400 cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => startStickyDrag(e, sticky.id, sticky.x, sticky.y)}
            >
              <span className="text-[9px] font-black text-black uppercase tracking-widest">📌 Note</span>
              {canDraw && (
                <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                  onClick={() => removeSticky(sticky.id)}
                  className="text-black/60 hover:text-black text-xs leading-none"
                >✕</button>
              )}
            </div>
            {/* Content */}
            <textarea
              value={sticky.text}
              onChange={(e) => {
                updateSticky(sticky.id, { text: e.target.value });
              }}
              onFocus={() => setEditingStickyId(sticky.id)}
              onBlur={() => {
                setEditingStickyId(null);
                // Broadcast on blur
                setStickies((prev) => {
                  const s = prev.find((st) => st.id === sticky.id);
                  if (s) broadcastSticky(s);
                  return prev;
                });
              }}
              readOnly={!canDraw}
              placeholder="Type a note…"
              rows={4}
              className="w-full bg-yellow-50 text-black text-xs p-2 resize-none focus:outline-none placeholder:text-black/40 font-medium leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
        ))}

        {/* ── Local laser pointer ── */}
        {tool === "laser" && canDraw && (
          <div
            style={{
              position: "absolute",
              left:     localLaser.x - 12,
              top:      localLaser.y - 12,
              width:    24,
              height:   24,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,50,50,1) 0%, rgba(255,50,50,0.6) 50%, transparent 100%)",
              boxShadow: "0 0 12px 4px rgba(255,50,50,0.5)",
              pointerEvents: "none",
              zIndex: 50,
              opacity: localLaser.visible ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* ── Remote laser pointers ── */}
        {Object.entries(remoteLasers).map(([key, laser]) => (
          <div
            key={key}
            style={{
              position: "absolute",
              left:     laser.x - 14,
              top:      laser.y - 14,
              width:    28,
              height:   28,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,50,50,1) 0%, rgba(255,80,80,0.5) 60%, transparent 100%)",
              boxShadow: "0 0 16px 6px rgba(255,50,50,0.45)",
              pointerEvents: "none",
              zIndex: 50,
              opacity: laser.visible ? 1 : 0,
              transition: "opacity 0.5s ease, left 0.05s linear, top 0.05s linear",
            }}
          />
        ))}

        {/* View-only floating badge */}
        {!canDraw && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/85 border border-[#2C2DE0]/30 px-2.5 py-1 rounded-full text-white/80 text-[10px] font-bold pointer-events-none z-10 shadow-lg select-none">
            👁️ View Only Mode
          </div>
        )}
      </div>
    </div>
  );
}
