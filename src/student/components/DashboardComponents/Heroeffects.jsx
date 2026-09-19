// HeroEffects.jsx
// Layer-3 reaction effects triggered by real user events or secret easter
// eggs. Each export is a small, self-contained overlay so HeroWelcome can
// mount whichever ones are currently active without coupling them together.

export const FireworksOverlay = ({ active }) => {
  if (!active) return null;
  const bursts = [
    { top: "20%", left: "20%", color: "#FFD86B", delay: "0s" },
    { top: "15%", left: "55%", color: "#6366F1", delay: "0.2s" },
    { top: "30%", left: "80%", color: "#FFFFFF", delay: "0.4s" },
  ];
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {bursts.map((b, i) => (
        <span
          key={i}
          className="absolute w-10 h-10 rounded-full"
          style={{
            top: b.top,
            left: b.left,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            animation: "fireworkBurst 1.1s ease-out forwards",
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
};

export const QRHologram = ({ active }) =>
  !active ? null : (
    <div
      aria-hidden="true"
      className="absolute -top-2 right-2 w-10 h-10 rounded-md bg-white dark:bg-gray-900/90 grid grid-cols-3 gap-[2px] p-1 shadow-lg"
      style={{ animation: "qrHologram 2.2s ease forwards" }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={`rounded-[1px] ${i % 2 === 0 ? "bg-[#0D2B3A]" : "bg-transparent"}`} />
      ))}
    </div>
  );

export const NotificationPulse = ({ active, label }) =>
  !active ? null : (
    <div
      className="absolute top-2 right-2 flex items-center gap-1.5 bg-white dark:bg-gray-900/95 text-[#2C2DE0] text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-md"
      style={{ animation: "noteShow 2.6s ease forwards" }}
      role="status"
    >
      <span className="w-4 h-4 rounded-full bg-[#2C2DE0]" style={{ animation: "bellShake 0.6s ease 2" }} />
      {label}
    </div>
  );

export const RingPulse = ({ active, color = "#6366F1" }) =>
  !active ? null : (
    <span
      aria-hidden="true"
      className="absolute inset-0 m-auto w-16 h-16 rounded-full border-2 pointer-events-none"
      style={{ borderColor: color, animation: "ringPulse 1s ease-out forwards" }}
    />
  );

// Secret modes: 10-click party mode and Konami rainbow celebration.
export const PartyModeOverlay = ({ active }) =>
  !active ? null : (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1.5 h-3 rounded-sm"
          style={{
            top: "-10px",
            left: `${(i * 41) % 100}%`,
            backgroundColor: ["#FFD86B", "#6366F1", "#46B3E8", "#FFFFFF"][i % 4],
            animation: `confettiFall ${0.8 + (i % 5) * 0.2}s ease-in ${(i % 6) * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );

export const RainbowOverlay = ({ active, children }) => (
  <div style={active ? { animation: "rainbowSpin 2.5s linear infinite" } : undefined}>{children}</div>
);