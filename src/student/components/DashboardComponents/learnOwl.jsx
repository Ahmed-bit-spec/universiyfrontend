// LearnVerseMascot.jsx
// "Kip" — the LearnVerse mascot, same green/black/white system as Lumi (UniLibrary owl).
// A small reading fox: perky ears, holds a glowing book, taps a paw when excited.
// Gentle float + blink always running; ear perks + tail wag on hover.
// Respects prefers-reduced-motion.

export const LearnVerseMascot = ({ size = 220 }) => (
    <div className="kip-float" style={{ width: size, position: "relative" }}>
        {/* soft halo behind him, green lamplight */}
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
            style={{ position: "relative", zIndex: 1, display: "block" }}
        >
            <defs>
                <radialGradient id="kipBody" cx="38%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#2A2E31" />
                    <stop offset="55%" stopColor="#1C1F21" />
                    <stop offset="100%" stopColor="#0E0F10" />
                </radialGradient>
                <radialGradient id="kipBelly" cx="50%" cy="20%" r="80%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF2FF" />
                </radialGradient>
                <linearGradient id="kipPageGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF2FF" />
                </linearGradient>
            </defs>

            {/* contact shadow */}
            <ellipse cx="100" cy="208" rx="46" ry="8" fill="#000" opacity="0.15" />

            {/* tail, wags on hover */}
            <path
                className="kip-tail"
                d="M150 150 Q186 140 190 176 Q184 198 156 196 Q170 176 150 150 Z"
                fill="#14171A"
                style={{ transformOrigin: "150px 150px" }}
            />

            {/* ears, perk on hover */}
            <path
                className="kip-ear-left"
                d="M64 44 L48 6 L84 32 Z"
                fill="#1C1F21"
                style={{ transformOrigin: "64px 44px" }}
            />
            <path
                className="kip-ear-right"
                d="M136 44 L152 6 L116 32 Z"
                fill="#1C1F21"
                style={{ transformOrigin: "136px 44px" }}
            />
            {/* inner ears */}
            <path d="M66 36 L58 16 L78 30 Z" fill="#2C2DE0" opacity="0.85" />
            <path d="M134 36 L142 16 L122 30 Z" fill="#2C2DE0" opacity="0.85" />

            {/* body */}
            <ellipse cx="100" cy="122" rx="56" ry="64" fill="url(#kipBody)" />
            {/* belly */}
            <ellipse cx="100" cy="134" rx="36" ry="46" fill="url(#kipBelly)" />

            {/* face disc / snout patch */}
            <ellipse cx="100" cy="90" rx="42" ry="38" fill="#FFFFFF" opacity="0.95" />

            {/* eyes */}
            <circle cx="82" cy="88" r="8" fill="#14171A" />
            <circle cx="118" cy="88" r="8" fill="#14171A" />
            <circle className="kip-blink" cx="82" cy="88" r="8" fill="#EEF2FF" style={{ transformOrigin: "82px 88px" }} />
            <circle className="kip-blink" cx="118" cy="88" r="8" fill="#EEF2FF" style={{ transformOrigin: "118px 88px" }} />
            <circle cx="84.5" cy="85.5" r="2.2" fill="#14171A" />
            <circle cx="120.5" cy="85.5" r="2.2" fill="#14171A" />

            {/* snout + nose */}
            <path d="M88 98 Q100 116 112 98 Q106 104 100 104 Q94 104 88 98 Z" fill="#FFFFFF" />
            <ellipse cx="100" cy="100" rx="5" ry="3.6" fill="#14171A" />

            {/* cheeks (subtle, scholarly, not too cute) */}
            <circle cx="70" cy="100" r="5" fill="#2C2DE0" opacity="0.18" />
            <circle cx="130" cy="100" r="5" fill="#2C2DE0" opacity="0.18" />

            {/* paws */}
            <ellipse cx="82" cy="188" rx="10" ry="7" fill="#14171A" />
            <ellipse cx="118" cy="188" rx="10" ry="7" fill="#14171A" />

            {/* the glowing book Kip holds */}
            <g transform="translate(62,148)">
                <ellipse cx="38" cy="20" rx="32" ry="17" fill="#2C2DE0" opacity="0.4" filter="blur(2px)" />
                <path d="M4 8 L38 0 L72 8 L72 24 L38 16 L4 24 Z" fill="url(#kipPageGrad)" stroke="#2C2DE0" strokeWidth="1.5" />
                <path d="M38 0 L38 16" stroke="#2C2DE0" strokeWidth="1.5" />
                <path d="M10 12 L32 8 M10 17 L32 13 M44 8 L66 12 M44 13 L66 17" stroke="#2C2DE0" strokeWidth="1" opacity="0.5" />
            </g>
        </svg>
    </div>
);

// Shared animation styles for the LearnVerse mascot.
export const LearnVerseMascotStyles = () => (
    <style>{`
    .kip-float {
      animation: kipFloat 5s ease-in-out infinite;
    }
    @keyframes kipFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }

    .kip-blink {
      animation: kipBlink 4.2s ease-in-out infinite;
    }
    @keyframes kipBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95%           { transform: scaleY(0.12); }
    }

    .kip-tail {
      transition: transform 0.4s ease;
    }
    .kip-mascot-wrap:hover .kip-tail {
      transform: rotate(-10deg);
    }

    .kip-ear-left, .kip-ear-right {
      transition: transform 0.3s ease;
    }
    .kip-mascot-wrap:hover .kip-ear-left {
      transform: rotate(-8deg) translateY(-2px);
    }
    .kip-mascot-wrap:hover .kip-ear-right {
      transform: rotate(8deg) translateY(-2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .kip-float, .kip-blink { animation: none; }
      .kip-tail, .kip-ear-left, .kip-ear-right { transition: none; }
    }
  `}</style>
);

export default LearnVerseMascot;

// ── Shared primary-action button style, same system as UniLibrary ────────────
export const PRIMARY_BTN =
  "bg-[#2C2DE0] text-white shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150";