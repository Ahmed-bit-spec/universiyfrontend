// OwlMascot.jsx
// "Lumi" — the e-library's owl mascot, in the green/black/white system.
// Visual branding only, no logic. She cradles a glowing book like a lantern.
// Gentle float + blink always running; wings flutter a little on hover.
// Respects prefers-reduced-motion.

export const OwlMascot = ({ size = 220 }) => (
    <div className="owl-float" style={{ width: size, position: "relative" }}>
        {/* soft halo behind her, green lamplight */}
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
                <radialGradient id="lumiBody" cx="38%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#2A2E31" />
                    <stop offset="55%" stopColor="#1C1F21" />
                    <stop offset="100%" stopColor="#0E0F10" />
                </radialGradient>
                <radialGradient id="lumiBelly" cx="50%" cy="20%" r="80%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF2FF" />
                </radialGradient>
                <radialGradient id="lanternGlow" cx="50%" cy="35%" r="75%">
                    <stop offset="0%" stopColor="#EEF2FF" />
                    <stop offset="55%" stopColor="#2C2DE0" />
                    <stop offset="100%" stopColor="#2C2DE0" />
                </radialGradient>
                <linearGradient id="pageGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF2FF" />
                </linearGradient>
            </defs>

            {/* contact shadow */}
            <ellipse cx="100" cy="208" rx="46" ry="8" fill="#000" opacity="0.15" />

            {/* left wing (tucked, gently flutters on hover) */}
            <path
                className="owl-wing-left"
                d="M46 108 Q18 118 16 158 Q34 150 48 132 Z"
                fill="#14171A"
                style={{ transformOrigin: "46px 108px" }}
            />
            {/* right wing */}
            <path
                className="owl-wing-right"
                d="M154 108 Q182 118 184 158 Q166 150 152 132 Z"
                fill="#14171A"
                style={{ transformOrigin: "154px 108px" }}
            />

            {/* ear tufts */}
            <path d="M62 42 L52 8 L82 34 Z" fill="#1C1F21" />
            <path d="M138 42 L148 8 L118 34 Z" fill="#1C1F21" />

            {/* body */}
            <ellipse cx="100" cy="120" rx="58" ry="66" fill="url(#lumiBody)" />
            {/* belly */}
            <ellipse cx="100" cy="132" rx="38" ry="48" fill="url(#lumiBelly)" />
            {/* belly feather flecks */}
            <g opacity="0.35" stroke="#9AD97A" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M86 108 q4 6 0 12" />
                <path d="M100 112 q4 6 0 12" />
                <path d="M114 108 q4 6 0 12" />
                <path d="M93 132 q4 6 0 12" />
                <path d="M107 132 q4 6 0 12" />
            </g>

            {/* face disc */}
            <circle cx="100" cy="86" r="44" fill="#FFFFFF" opacity="0.95" />

            {/* eyes (glasses-like rings, scholarly) */}
            <circle cx="80" cy="86" r="17" fill="#14171A" />
            <circle cx="120" cy="86" r="17" fill="#14171A" />
            <circle cx="80" cy="86" r="17" fill="none" stroke="#2C2DE0" strokeWidth="2.5" />
            <circle cx="120" cy="86" r="17" fill="none" stroke="#2C2DE0" strokeWidth="2.5" />
            <circle className="owl-blink" cx="80" cy="86" r="8.5" fill="#EEF2FF" style={{ transformOrigin: "80px 86px" }} />
            <circle className="owl-blink" cx="120" cy="86" r="8.5" fill="#EEF2FF" style={{ transformOrigin: "120px 86px" }} />
            <circle cx="83" cy="83" r="2.6" fill="#14171A" />
            <circle cx="123" cy="83" r="2.6" fill="#14171A" />
            <circle cx="80" cy="86" r="1.4" fill="#fff" />
            <circle cx="120" cy="86" r="1.4" fill="#fff" />

            {/* beak */}
            <path d="M96 100 L104 100 L100 110 Z" fill="#2C2DE0" />

            {/* feet */}
            <path d="M84 184 v10 M84 194 l-6 5 M84 194 l6 5" stroke="#14171A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M116 184 v10 M116 194 l-6 5 M116 194 l6 5" stroke="#14171A" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* the lantern-book she cradles */}
            <g transform="translate(64,150)">
                <ellipse cx="36" cy="20" rx="30" ry="16" fill="url(#lanternGlow)" opacity="0.55" filter="blur(2px)" />
                <path d="M4 8 L36 0 L68 8 L68 24 L36 16 L4 24 Z" fill="url(#pageGrad)" stroke="#2C2DE0" strokeWidth="1.5" />
                <path d="M36 0 L36 16" stroke="#2C2DE0" strokeWidth="1.5" />
                <path d="M10 12 L30 8 M10 17 L30 13 M42 8 L62 12 M42 13 L62 17" stroke="#2C2DE0" strokeWidth="1" opacity="0.5" />
            </g>
        </svg>
    </div>
);

// Shared animation styles for the owl mascot.
export const OwlMascotStyles = () => (
    <style>{`
    .owl-float {
      animation: owlFloat 5s ease-in-out infinite;
    }
    @keyframes owlFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }

    .owl-blink {
      animation: owlBlink 4.5s ease-in-out infinite;
    }
    @keyframes owlBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95%           { transform: scaleY(0.12); }
    }

    .owl-wing-left, .owl-wing-right {
      transition: transform 0.4s ease;
    }
    .owl-mascot-wrap:hover .owl-wing-left {
      transform: rotate(-14deg) translateX(-3px);
    }
    .owl-mascot-wrap:hover .owl-wing-right {
      transform: rotate(14deg) translateX(3px);
    }

    @media (prefers-reduced-motion: reduce) {
      .owl-float, .owl-blink { animation: none; }
      .owl-wing-left, .owl-wing-right { transition: none; }
    }
  `}</style>
);

export default OwlMascot;