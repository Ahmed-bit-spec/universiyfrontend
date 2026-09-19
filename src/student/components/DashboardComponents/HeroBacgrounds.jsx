// HeroBackground.jsx
import { useMemo } from "react";

const ATMOSPHERES = {
  sunrise: {
    gradient: "from-[#FFB46B] via-[#6366F1] to-[#2C2DE0]",
    glow: "bg-[#FFD7A0]/30",
    rayOpacity: 0.16,
  },
  sunny: {
    gradient: "from-[#2C2DE0] via-[#5B7FFF] to-[#2C2DE0]",
    glow: "bg-white dark:bg-gray-900/15",
    rayOpacity: 0.12,
  },
  dusk: {
    gradient: "from-[#E0762C] via-[#4C4FE0] to-[#1E1FAA]",
    glow: "bg-[#FF8A4C]/25",
    rayOpacity: 0.14,
  },
  night: {
    gradient: "from-[#0E1B3A] via-[#141A52] to-[#0A0E2A]",
    glow: "bg-[#6366F1]/10",
    rayOpacity: 0.05,
  },
};

const HeroBackground = ({ atmosphere = "sunny", paused = false, reducedMotion = false }) => {
  const theme = ATMOSPHERES[atmosphere] || ATMOSPHERES.sunny;
  const isNight = atmosphere === "night";

  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        left: `${8 + i * 13}%`,
        delay: `${i * 1.6}s`,
        duration: `${9 + (i % 3) * 2}s`,
        size: 10 + (i % 3) * 4,
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        top: `${10 + ((i * 37) % 80)}%`,
        left: `${5 + ((i * 53) % 90)}%`,
        delay: `${(i * 0.7) % 4}s`,
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        top: `${(i * 17) % 60}%`,
        left: `${(i * 29) % 100}%`,
        delay: `${(i * 0.3) % 5}s`,
        size: 1 + (i % 3),
      })),
    []
  );

  const fireflies = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        top: `${30 + ((i * 23) % 50)}%`,
        left: `${10 + ((i * 31) % 80)}%`,
        delay: `${(i * 0.5) % 4}s`,
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${theme.gradient} transition-colors duration-1000`}
      style={{ animation: !reducedMotion && !paused ? "cameraZoom 1.2s ease-out" : undefined }}
    >
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-gradient-to-tr from-white via-transparent to-transparent" />

      <div
        className={`absolute -top-16 -left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${theme.glow}`}
        style={{ animation: reducedMotion || paused ? "none" : "blobDrift1 16s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-[#1E1FAA]/30 blur-3xl pointer-events-none"
        style={{ animation: reducedMotion || paused ? "none" : "blobDrift2 18s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-52 h-52 rounded-full bg-white dark:bg-gray-900/8 blur-2xl pointer-events-none"
        style={{ animation: reducedMotion || paused ? "none" : "blobDrift3 13s ease-in-out infinite" }}
      />

      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "conic-gradient(from 200deg at 80% 0%, transparent 0deg, #fff 8deg, transparent 20deg, transparent 360deg)",
          opacity: theme.rayOpacity,
          animation: reducedMotion || paused ? "none" : "rayPulse 6s ease-in-out infinite",
        }}
      />

      {!reducedMotion &&
        !paused &&
        leaves.map((leaf, i) => (
          <span
            key={`leaf-${i}`}
            className="absolute top-0 pointer-events-none"
            style={{ left: leaf.left, width: leaf.size, height: leaf.size, animation: `leafFall ${leaf.duration} linear infinite`, animationDelay: leaf.delay }}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 2C4 6 2 14 10 18C18 14 16 6 10 2Z" fill="#EEF2FF" opacity="0.5" />
            </svg>
          </span>
        ))}

      {!reducedMotion &&
        !paused &&
        sparkles.map((s, i) => (
          <span
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white dark:bg-gray-900 pointer-events-none"
            style={{ top: s.top, left: s.left, animation: `sparkleTwinkle 2.4s ease-in-out infinite`, animationDelay: s.delay }}
          />
        ))}

      {isNight && (
        <>
          <div className="absolute top-6 right-10 w-10 h-10 rounded-full bg-[#F4F1E6] shadow-[0_0_24px_6px_rgba(244,241,230,0.4)] pointer-events-none" />
          {stars.map((s, i) => (
            <span
              key={`star-${i}`}
              className="absolute rounded-full bg-white dark:bg-gray-900 pointer-events-none"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, animation: reducedMotion || paused ? "none" : "sparkleTwinkle 3s ease-in-out infinite", animationDelay: s.delay }}
            />
          ))}
          {fireflies.map((f, i) => (
            <span
              key={`firefly-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_6px_2px_rgba(99,102,241,0.6)] pointer-events-none"
              style={{ top: f.top, left: f.left, animation: reducedMotion || paused ? "none" : "fireflyDrift 5s ease-in-out infinite", animationDelay: f.delay }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default HeroBackground;