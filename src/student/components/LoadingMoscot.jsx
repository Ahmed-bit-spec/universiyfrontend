// LoadingMascot.jsx
// Two loading states built around the same mascot family instead of a
// generic spinner:
//   • <PageLoader />   — full-page loading screen. SpiritBot floats and
//     bobs in place, its lantern-book pulsing, while three dots step
//     underneath like a heartbeat. Use this for route-level loads.
//   • <InlineLoader /> — compact version for cards/panels mid-page (e.g.
//     while a single ActivityPanel refetches). Small Sprout walking in
//     place, no full backdrop.
//
// Both respect prefers-reduced-motion (animations drop to a simple fade).

import { SpiritBot, Sprout } from "./DashboardComponents/Moscot";

export const PageLoader = ({ label}) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#FBFEF7] dark:bg-black">
    <div className="relative">
      {/* ambient glow pulsing with the lantern */}
      <div className="absolute inset-0 -m-10 rounded-full bg-[#2C2DE0]/25 blur-3xl loader-glow" />
      <div className="loader-float">
        <SpiritBot size={108} />
      </div>
    </div>

    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{label}</p>

    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#2C2DE0] loader-dot" style={{ animationDelay: "0s" }} />
      <span className="w-2 h-2 rounded-full bg-[#2C2DE0] loader-dot" style={{ animationDelay: "0.15s" }} />
      <span className="w-2 h-2 rounded-full bg-[#2C2DE0] loader-dot" style={{ animationDelay: "0.3s" }} />
    </div>

    <style>{`
      .loader-float { animation: loaderFloat 1.8s ease-in-out infinite; }
      .loader-glow  { animation: loaderGlow 1.8s ease-in-out infinite; }
      .loader-dot   { animation: loaderDot 1s ease-in-out infinite; }

      @keyframes loaderFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
      @keyframes loaderGlow {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50%      { opacity: 0.85; transform: scale(1.08); }
      }
      @keyframes loaderDot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40%           { transform: translateY(-6px); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .loader-float, .loader-glow, .loader-dot { animation: none; }
      }
    `}</style>
  </div>
);

export const InlineLoader = ({ label = "Loading…", className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
    <div className="loader-walk">
      <Sprout size={48} />
    </div>
    <p className="text-xs font-semibold text-gray-400">{label}</p>

    <style>{`
      .loader-walk { animation: loaderWalk 1s ease-in-out infinite; }
      @keyframes loaderWalk {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25%      { transform: translateY(-4px) rotate(-3deg); }
        75%      { transform: translateY(-4px) rotate(3deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .loader-walk { animation: none; }
      }
    `}</style>
  </div>
);