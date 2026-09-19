// HeroGreeting.jsx
// The speech bubble SpiritBot holds: types the greeting letter-by-letter
// with a blinking caret, holds, then folds away — driven purely by CSS
// timing (no per-character JS state) so it stays cheap and jank-free.
// Real copy comes from t(); name + line come from real user/session data.

import { useMemo } from "react";

const HeroGreeting = ({ greetingLine, name, subLine, visible = true, typingDurationMs = 1400 }) => {
  const fullText = `${greetingLine} ${name}`;
  const charCount = useMemo(() => fullText.length, [fullText]);

  if (!visible) return null;

  return (
    <div className="hero-note absolute left-1/2 -translate-x-1/2 -top-3 sm:-top-5 z-10 pointer-events-none" role="status">
      <div className="relative bg-white dark:bg-[#14171a] rounded-2xl px-4 py-2.5 shadow-lg shadow-black/10 border border-[#2C2DE0] dark:border-white/10 whitespace-nowrap overflow-hidden">
        <p
          className="text-sm font-black text-gray-900 dark:text-white leading-snug inline-block overflow-hidden whitespace-nowrap align-bottom border-r-2 border-[#2C2DE0]"
          style={{
            width: `${charCount}ch`,
            animation: `heroType ${typingDurationMs}ms steps(${charCount}) forwards, caretBlink 0.8s step-end infinite`,
          }}
        >
          {fullText}
        </p>
        {subLine && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5 leading-none opacity-0 hero-subline">{subLine}</p>
        )}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 bg-white dark:bg-[#14171a] border-b border-r border-[#2C2DE0] dark:border-white/10 rotate-45" />
      </div>

      <style>{`
        @keyframes heroType { from { width: 0; } to { width: ${charCount}ch; } }
        .hero-subline { animation: subFadeIn 0.4s ease forwards; animation-delay: ${typingDurationMs + 200}ms; }
        @keyframes subFadeIn { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .hero-note p { width: ${charCount}ch !important; animation: none !important; border-right: none !important; }
          .hero-subline { opacity: 1; animation: none; }
        }
      `}</style>
    </div>
  );
};

export default HeroGreeting;