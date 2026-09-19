// HeroParticles.jsx
// Layer-1 companion to HeroBackground: upward-floating motes for ambient
// life, plus a one-shot confetti burst used during the page-load entrance
// and on celebration events (streak up, account verified, Friday mood).

import { useMemo } from "react";

const CONFETTI_COLORS = ["#FFFFFF", "#6366F1", "#FFD86B", "#EEF2FF"];

export const AmbientParticles = ({ count = 14, reducedMotion = false, paused = false }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: `${4 + ((i * 41) % 92)}%`,
        bottom: `${(i * 13) % 60}%`,
        delay: `${(i * 0.9) % 10}s`,
        duration: `${8 + (i % 4) * 2}s`,
        size: 2 + (i % 3),
      })),
    [count]
  );

  if (reducedMotion) return null;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={`particle-${i}`}
          className="absolute rounded-full bg-white dark:bg-gray-900/60"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            animation: paused ? "none" : `particleFloat ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export const ConfettiBurst = ({ active, originX = "50%", count = 18 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: `${-20 + Math.random() * 40}px`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${Math.random() * 0.3}s`,
        duration: `${0.9 + Math.random() * 0.6}s`,
        rotate: Math.random() * 360,
        size: 4 + Math.random() * 4,
      })),
    [count, active] // re-randomize each time it fires
  );

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 pointer-events-none"
      style={{ left: originX, transform: "translateX(-50%)" }}
    >
      {pieces.map((p, i) => (
        <span
          key={`confetti-${i}`}
          className="absolute rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration} ease-in forwards`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};