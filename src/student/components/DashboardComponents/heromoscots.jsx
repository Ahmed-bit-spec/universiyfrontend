// HeroMascots.jsx
// Layer 2: the mascot engine. Three personalities —
//   GraduateBot — the steady guide (idle: breathe, blink, look, wave)
//   SpiritBot   — the floating AI companion (idle: float, glow, blink)
//   Sprout      — the cheerful sidekick (idle: bounce, leaf-wave, smile)
// Each accepts an `event` prop (string id from HeroEvents.js or null) that
// layers a reaction animation on top of its permanent idle loop, plus
// onHover / onClick / onDoubleClick / onLongPress micro-interactions.

import { useRef, useCallback } from "react";

const reactionStyle = (event, matches, animation) =>
  event && matches.includes(event) ? { animation } : undefined;

// Shared micro-interaction wiring: hover smiles, click waves, double-click
// dances, long-press triggers a secret animation callback.
const useMicroInteractions = ({ onSmile, onWave, onDance, onSecret }) => {
  const pressTimer = useRef(null);

  const handlers = {
    onMouseEnter: () => onSmile?.(),
    onFocus: () => onSmile?.(),
    onClick: () => onWave?.(),
    onDoubleClick: () => onDance?.(),
    onMouseDown: () => {
      pressTimer.current = window.setTimeout(() => onSecret?.(), 650);
    },
    onMouseUp: () => window.clearTimeout(pressTimer.current),
    onMouseLeave: () => window.clearTimeout(pressTimer.current),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") onWave?.();
    },
  };

  return handlers;
};

export const GraduateBot = ({
  size = 84,
  event,
  dancing = false,
  label = "GraduateBot, your campus guide",
  onSmile,
  onWave,
  onDance,
  onSecret,
}) => {
  const handlers = useMicroInteractions({ onSmile, onWave, onDance: () => onDance?.() || dancing, onSecret });
  const reaction =
    reactionStyle(event, ["graduate-open-laptop", "graduate-celebrate"], "mPop 0.7s ease") ||
    reactionStyle(event, ["graduate-drink-coffee"], "mBow 1.2s ease") ||
    (dancing ? { animation: "mDance 0.6s ease-in-out infinite" } : undefined);

  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={0}
      {...handlers}
      className="hover:translate-y-0.5 active:translate-y-1 transition-all duration-150 group"
    >
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2} fill="none" style={{ transformOrigin: "50% 100%", ...reaction }}>
        <ellipse cx="50" cy="114" rx="26" ry="5" fill="#14171a" opacity="0.1" />
        <rect x="34" y="86" width="10" height="22" rx="4" fill="#2D6A00" />
        <rect x="56" y="86" width="10" height="22" rx="4" fill="#2D6A00" />
        <rect x="24" y="46" width="52" height="46" rx="14" fill="#EEF2FF" style={{ animation: "mBreathe 4.5s ease-in-out infinite" }} />
        <rect x="34" y="58" width="32" height="22" rx="8" fill="#EEF2FF" />
        <g style={{ transformOrigin: "74px 56px", animation: "mWaveRight 6s ease-in-out infinite", animationDelay: "4s" }}>
          <rect x="70" y="40" width="9" height="26" rx="4.5" fill="#EEF2FF" />
        </g>
        <rect x="21" y="56" width="9" height="22" rx="4.5" fill="#EEF2FF" />
        <g style={{ transformOrigin: "50px 30px", animation: "mLookAround 7s ease-in-out infinite" }}>
          <rect x="28" y="10" width="44" height="38" rx="14" fill="#EEF2FF" />
          <rect x="36" y="20" width="28" height="18" rx="6" fill="#14171a" />
          <circle cx="45" cy="29" r="2.6" fill="#6366F1" style={{ animation: "mBlink 5s ease-in-out infinite" }} />
          <circle cx="55" cy="29" r="2.6" fill="#6366F1" style={{ animation: "mBlink 5s ease-in-out infinite" }} />
          <path d="M44 33 Q50 37 56 33" stroke="#6366F1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
        <rect x="30" y="2" width="40" height="6" rx="2" fill="#14171a" />
        <path d="M22 6 L50 -4 L78 6 L50 16 Z" fill="#14171a" />
        <circle cx="78" cy="6" r="2" fill="#F5A623" />
        <line x1="78" y1="6" x2="78" y2="16" stroke="#F5A623" strokeWidth="1.5" />
      </svg>
    </button>
  );
};

export const Sprout = ({ size = 70, event, label = "Sprout, your cheerful companion", onSmile, onWave, onDance, onSecret }) => {
  const handlers = useMicroInteractions({ onSmile, onWave, onDance, onSecret });
  const reaction =
    reactionStyle(event, ["sprout-grow-flower"], "mPop 0.9s ease") ||
    reactionStyle(event, ["sprout-sneeze"], "mBow 0.5s ease 2") ||
    reactionStyle(event, ["user-streak-up", "user-reservation-created"], "clapBounce 0.6s ease-in-out 2");

  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={0}
      {...handlers}
      className="hover:translate-y-0.5 active:translate-y-1 transition-all duration-150 group"
    >
      <svg viewBox="0 0 90 100" width={size} height={size * 1.1} fill="none" style={{ transformOrigin: "50% 100%", ...reaction }}>
        <ellipse cx="45" cy="94" rx="22" ry="4.5" fill="#14171a" opacity="0.1" />
        <g style={{ animation: "mBreathe 3.2s ease-in-out infinite" }}>
          <path d="M40 16 Q26 4 14 10 Q22 22 38 24Z" fill="#6EDB8F" />
          <path d="M50 16 Q64 4 76 10 Q68 22 52 24Z" fill="#6EDB8F" style={{ transformOrigin: "60px 14px", animation: "mWaveRight 5s ease-in-out infinite" }} />
          <ellipse cx="45" cy="58" rx="32" ry="34" fill="#6366F1" />
          <ellipse cx="45" cy="64" rx="20" ry="22" fill="#EEF2FF" />
          <g style={{ transformOrigin: "16px 56px", animation: "mWaveLeft 6s ease-in-out infinite", animationDelay: "4s" }}>
            <ellipse cx="13" cy="50" rx="7" ry="14" fill="#6EDB8F" />
          </g>
          <ellipse cx="77" cy="62" rx="7" ry="14" fill="#6EDB8F" />
          <circle cx="36" cy="56" r="6" fill="#14171a" style={{ animation: "mBlink 4.5s ease-in-out infinite" }} />
          <circle cx="54" cy="56" r="6" fill="#14171a" style={{ animation: "mBlink 4.5s ease-in-out infinite" }} />
          <circle cx="38" cy="54" r="1.8" fill="#fff" />
          <circle cx="56" cy="54" r="1.8" fill="#fff" />
          <path d="M37 66 Q45 73 53 66" stroke="#2D6A00" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <ellipse cx="34" cy="92" rx="7" ry="3.5" fill="#6EDB8F" />
          <ellipse cx="56" cy="92" rx="7" ry="3.5" fill="#6EDB8F" />
        </g>
      </svg>
    </button>
  );
};

export const SpiritBot = ({ size = 92, event, label = "SpiritBot, your AI study assistant", onSmile, onWave, onDance, onSecret }) => {
  const handlers = useMicroInteractions({ onSmile, onWave, onDance, onSecret });
  const reaction =
    reactionStyle(event, ["spirit-spin"], "mSpin 0.9s ease-in-out") ||
    reactionStyle(event, ["spirit-throw-stars", "spirit-fly-around"], "mPop 0.8s ease") ||
    reactionStyle(event, ["user-reservation-expired"], "mSad 1.4s ease-in-out infinite");

  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={0}
      {...handlers}
      className="hover:translate-y-0.5 active:translate-y-1 transition-all duration-150 group"
    >
      <svg viewBox="0 0 96 110" width={size} height={size * 1.15} fill="none" style={{ transformOrigin: "50% 100%", ...reaction }}>
        <ellipse cx="48" cy="104" rx="20" ry="4" fill="#14171a" opacity="0.08" />
        <g style={{ animation: "mBreathe 3.8s ease-in-out infinite" }}>
          <circle cx="48" cy="52" r="34" fill="#46B3E8" />
          <circle cx="48" cy="52" r="34" fill="url(#spiritSheen)" opacity="0.5" />
          <line x1="48" y1="18" x2="48" y2="6" stroke="#1F6FA0" strokeWidth="2.5" />
          <circle cx="48" cy="5" r="4" fill="#6366F1" style={{ animation: "mFlicker 2.2s ease-in-out infinite" }} />
          <circle cx="38" cy="50" r="6.5" fill="#0D2B3A" style={{ animation: "mBlink 5s ease-in-out infinite" }} />
          <circle cx="58" cy="50" r="6.5" fill="#0D2B3A" style={{ animation: "mBlink 5s ease-in-out infinite" }} />
          <circle cx="40" cy="47.5" r="2" fill="#fff" />
          <circle cx="60" cy="47.5" r="2" fill="#fff" />
          <path d="M38 62 Q48 68 58 62" stroke="#0D2B3A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <g transform="translate(28,80)">
            <path d="M0 6 L20 1 L40 6 L40 18 L20 13 L0 18 Z" fill="#0D2B3A" />
            <path d="M0 6 L20 1 L40 6 L40 16 L20 11 L0 16 Z" fill="url(#bookGlow)" />
          </g>
        </g>
        <defs>
          <radialGradient id="spiritSheen" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bookGlow" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#EFFFD6" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#2C2DE0" />
          </radialGradient>
        </defs>
      </svg>
    </button>
  );
};

// The full three-mascot stage, wired to entrance + patrol + event state.
// HeroWelcome owns the actual event values and just passes them down.
const HeroMascots = ({ event, dancing, onMascotClick, onMascotDance, onMascotLongPress }) => (
  <div className="relative w-full h-[160px] sm:h-[180px] flex items-end justify-center lg:justify-start gap-3 sm:gap-8 overflow-visible">
    <div className="hero-enter-left">
      <div className="hero-patrol-left">
        <GraduateBot size={84} event={event} dancing={dancing === "graduate"} onWave={() => onMascotClick?.("graduate")} onDance={() => onMascotDance?.("graduate")} onSecret={() => onMascotLongPress?.("graduate")} />
      </div>
    </div>
    <div className="hero-enter-top -mb-2 relative">
      <div className="hero-patrol-center">
        <SpiritBot size={92} event={event} onWave={() => onMascotClick?.("spirit")} onDance={() => onMascotDance?.("spirit")} onSecret={() => onMascotLongPress?.("spirit")} />
      </div>
    </div>
    <div className="hero-enter-right">
      <div className="hero-patrol-right">
        <Sprout size={70} event={event} onWave={() => onMascotClick?.("sprout")} onDance={() => onMascotDance?.("sprout")} onSecret={() => onMascotLongPress?.("sprout")} />
      </div>
    </div>
  </div>
);

export default HeroMascots;