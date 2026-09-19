// Mascots.jsx
// Three companions, each a different "kind" of helper:
//   • GraduateBot — boxy robot in a grad cap, "I'll guide you." Enters left.
//   • Sprout       — small round creature, "I'm cheering for you." Enters right.
//   • SpiritBot    — floating AI orb cradling a book, "I hold the knowledge."
//     Drops in from above, settles center, and is the one who holds up the
//     welcome note (so the page never needs a separate "Welcome back, X"
//     headline — the mascots deliver it).
//
// Sequence: entrance (0–0.9s) → note pops up in SpiritBot's hands and holds
// for ~3s → note fades → all three break into a permanent left/right patrol
// (center drifts in a small loop). Respects prefers-reduced-motion.

export const GraduateBot = ({ size = 96 }) => (
  <svg viewBox="0 0 100 120" width={size} height={size * 1.2} fill="none" className="mascot-bow" style={{ transformOrigin: "50% 100%" }}>
    <ellipse cx="50" cy="114" rx="26" ry="5" fill="#14171a" opacity="0.10" />
    <rect x="34" y="86" width="10" height="22" rx="4" fill="#2D6A00" />
    <rect x="56" y="86" width="10" height="22" rx="4" fill="#2D6A00" />
    <rect x="24" y="46" width="52" height="46" rx="14" fill="#2C2DE0" />
    <rect x="34" y="58" width="32" height="22" rx="8" fill="#EEF2FF" />
    <g className="mascot-wave-right" style={{ transformOrigin: "74px 56px" }}>
      <rect x="70" y="40" width="9" height="26" rx="4.5" fill="#2C2DE0" />
    </g>
    <rect x="21" y="56" width="9" height="22" rx="4.5" fill="#2C2DE0" />
    <rect x="28" y="10" width="44" height="38" rx="14" fill="#2C2DE0" />
    <rect x="36" y="20" width="28" height="18" rx="6" fill="#14171a" />
    <circle cx="45" cy="29" r="2.6" fill="#6366F1" className="mascot-blink" />
    <circle cx="55" cy="29" r="2.6" fill="#6366F1" className="mascot-blink" />
    <path d="M44 33 Q50 37 56 33" stroke="#6366F1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <rect x="30" y="2" width="40" height="6" rx="2" fill="#14171a" />
    <path d="M22 6 L50 -4 L78 6 L50 16 Z" fill="#14171a" />
    <circle cx="78" cy="6" r="2" fill="#F5A623" />
    <line x1="78" y1="6" x2="78" y2="16" stroke="#F5A623" strokeWidth="1.5" />
  </svg>
);

export const Sprout = ({ size = 76 }) => (
  <svg viewBox="0 0 90 100" width={size} height={size * 1.1} fill="none" className="mascot-bow" style={{ transformOrigin: "50% 100%" }}>
    <ellipse cx="45" cy="94" rx="22" ry="4.5" fill="#14171a" opacity="0.10" />
    <path d="M40 16 Q26 4 14 10 Q22 22 38 24Z" fill="#2C2DE0" />
    <path d="M50 16 Q64 4 76 10 Q68 22 52 24Z" fill="#2C2DE0" />
    <ellipse cx="45" cy="58" rx="32" ry="34" fill="#6366F1" />
    <ellipse cx="45" cy="64" rx="20" ry="22" fill="#EEF2FF" />
    <g className="mascot-wave-left" style={{ transformOrigin: "16px 56px" }}>
      <ellipse cx="13" cy="50" rx="7" ry="14" fill="#2C2DE0" />
    </g>
    <ellipse cx="77" cy="62" rx="7" ry="14" fill="#2C2DE0" />
    <circle cx="36" cy="56" r="6" fill="#14171a" className="mascot-blink" />
    <circle cx="54" cy="56" r="6" fill="#14171a" className="mascot-blink" />
    <circle cx="38" cy="54" r="1.8" fill="#fff" />
    <circle cx="56" cy="54" r="1.8" fill="#fff" />
    <path d="M37 66 Q45 73 53 66" stroke="#2D6A00" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <ellipse cx="34" cy="92" rx="7" ry="3.5" fill="#2C2DE0" />
    <ellipse cx="56" cy="92" rx="7" ry="3.5" fill="#2C2DE0" />
  </svg>
);

export const SpiritBot = ({ size = 84 }) => (
  <svg viewBox="0 0 96 110" width={size} height={size * 1.15} fill="none" className="mascot-bow" style={{ transformOrigin: "50% 100%" }}>
    <ellipse cx="48" cy="104" rx="20" ry="4" fill="#14171a" opacity="0.08" />
    <circle cx="48" cy="52" r="34" fill="#46B3E8" />
    <circle cx="48" cy="52" r="34" fill="url(#spiritSheen)" opacity="0.5" />
    <line x1="48" y1="18" x2="48" y2="6" stroke="#1F6FA0" strokeWidth="2.5" />
    <circle cx="48" cy="5" r="4" fill="#6366F1" className="mascot-flicker" />
    <circle cx="38" cy="50" r="6.5" fill="#0D2B3A" className="mascot-blink" />
    <circle cx="58" cy="50" r="6.5" fill="#0D2B3A" className="mascot-blink" />
    <circle cx="40" cy="47.5" r="2" fill="#fff" />
    <circle cx="60" cy="47.5" r="2" fill="#fff" />
    <path d="M38 62 Q48 68 58 62" stroke="#0D2B3A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <g transform="translate(28,80)">
      <path d="M0 6 L20 1 L40 6 L40 18 L20 13 L0 18 Z" fill="#0D2B3A" />
      <path d="M0 6 L20 1 L40 6 L40 16 L20 11 L0 16 Z" fill="url(#bookGlow)" />
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
);

// The note SpiritBot holds up — carries the personalized greeting so no
// separate headline has to repeat it. Pops in after the entrance settles,
// holds for ~3s, then fades as the trio starts patrolling.
export const WelcomeNote = ({ eyebrow, name }) => (
  <div className="mascot-note absolute left-1/2 -translate-x-1/2 -top-3 sm:-top-4 z-10 pointer-events-none">
    <div className="relative bg-white dark:bg-[#14171a] rounded-2xl px-4 py-2.5 shadow-lg shadow-black/10 border border-[#2C2DE0] dark:border-white/10 whitespace-nowrap">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#2C2DE0] leading-none mb-1">
        {eyebrow}
      </p>
      <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
        {name}
      </p>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 bg-white dark:bg-[#14171a] border-b border-r border-[#2C2DE0] dark:border-white/10 rotate-45" />
    </div>
  </div>
);

// Shared keyframes for all three mascots + the note + the patrol loop.
export const MascotStyles = () => (
  <style>{`
    .mascot-blink { animation: mBlink 5s ease-in-out infinite; transform-origin: center; }
    .mascot-flicker { animation: mFlicker 2.2s ease-in-out infinite; }
    .mascot-bow {
      animation: mBow 6s ease-in-out infinite;
      animation-delay: 4s; /* only starts bowing once the note phase ends */
    }
    .mascot-wave-left  { animation: mWaveLeft 6s ease-in-out infinite; animation-delay: 4s; }
    .mascot-wave-right { animation: mWaveRight 6s ease-in-out infinite; animation-delay: 4s; }

    @keyframes mBlink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
    @keyframes mFlicker { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }

    @keyframes mBow {
      0%, 70%   { transform: translateY(0) rotate(0deg); }
      78%       { transform: translateY(2px) rotate(8deg); }
      86%       { transform: translateY(0) rotate(0deg); }
      100%      { transform: translateY(0) rotate(0deg); }
    }
    @keyframes mWaveLeft {
      0%, 70%  { transform: rotate(0deg); }
      75%      { transform: rotate(-35deg); }
      80%      { transform: rotate(-10deg); }
      85%      { transform: rotate(-35deg); }
      90%, 100%{ transform: rotate(0deg); }
    }
    @keyframes mWaveRight {
      0%, 70%  { transform: rotate(0deg); }
      75%      { transform: rotate(35deg); }
      80%      { transform: rotate(10deg); }
      85%      { transform: rotate(35deg); }
      90%, 100%{ transform: rotate(0deg); }
    }

    /* Note: in at ~1s (after entrance), held until ~4s, then fades as patrol begins */
    .mascot-note {
      opacity: 0;
      animation: noteShow 4.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: 0.9s;
    }
    @keyframes noteShow {
      0%   { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
      14%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      78%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -8px) scale(0.95); }
    }

    @media (prefers-reduced-motion: reduce) {
      .mascot-blink, .mascot-flicker, .mascot-bow, .mascot-wave-left, .mascot-wave-right { animation: none; }
      .mascot-note { animation: noteShowReduced 4.2s ease forwards; animation-delay: 0.2s; }
    }
    @keyframes noteShowReduced {
      0%   { opacity: 0; }
      10%  { opacity: 1; }
      85%  { opacity: 1; }
      100% { opacity: 0; }
    }

    /* Continuous pacing — begins once the note fades (~4s in), so the trio
       never just lands and freezes. Left/right patrol a short stretch;
       center drifts in a small loop. */
    .mascot-patrol-left   { animation: patrolLeft 5.5s ease-in-out infinite; animation-delay: 4s; }
    .mascot-patrol-right  { animation: patrolRight 5.5s ease-in-out infinite; animation-delay: 4s; }
    .mascot-patrol-center { animation: patrolCenter 6.5s ease-in-out infinite; animation-delay: 4s; }

    @keyframes patrolLeft {
      0%, 100% { transform: translateX(0) scaleX(1); }
      45%      { transform: translateX(26px) scaleX(1); }
      50%      { transform: translateX(26px) scaleX(-1); }
      95%      { transform: translateX(0) scaleX(-1); }
      100%     { transform: translateX(0) scaleX(1); }
    }
    @keyframes patrolRight {
      0%, 100% { transform: translateX(0) scaleX(-1); }
      45%      { transform: translateX(-26px) scaleX(-1); }
      50%      { transform: translateX(-26px) scaleX(1); }
      95%      { transform: translateX(0) scaleX(1); }
      100%     { transform: translateX(0) scaleX(-1); }
    }
    @keyframes patrolCenter {
      0%, 100% { transform: translate(0, 0); }
      25%      { transform: translate(14px, -6px); }
      50%      { transform: translate(0, -10px); }
      75%      { transform: translate(-14px, -6px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .mascot-patrol-left, .mascot-patrol-right, .mascot-patrol-center { animation: none; }
    }
  `}</style>
);