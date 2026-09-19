// components/RewardModal.jsx — Uniso E-Library
// Final step of the loop: BookReader page(s) → ChapterComplete → QuizModal →
// RewardModal → back to reading (or Home).
//
// Usage from BookReader.jsx:
//   {reward && (
//     <RewardModal
//       T={T}
//       score={reward.score}
//       total={reward.total}
//       xpEarned={reward.xpEarned}
//       streak={streak}          // from useGamification
//       leveledUp={reward.leveledUp}
//       onContinue={() => setReward(null)}
//     />
//   )}

import { Star, Flame, TrendingUp } from "lucide-react";

const PRIMARY_GREEN = "#2C2DE0";
const PRIMARY_GREEN_SHADOW = "#1E1FAA";
const primaryBtn = () => ({
  background: PRIMARY_GREEN, color: "#fff", border: "none",
  boxShadow: `0 4px 0 ${PRIMARY_GREEN_SHADOW}`, transition: "all 0.12s",
});

const RewardModal = ({ T, score, total, xpEarned, streak, leveledUp = false, onContinue }) => {
  const perfect = total > 0 && score === total;
  const filledStars = total > 0 ? Math.round((score / total) * 5) : 5;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: T.surface, borderRadius: "24px", border: `1px solid ${T.border}`,
        padding: "34px 28px 26px", maxWidth: "360px", width: "100%",
        textAlign: "center", boxShadow: T.shadow, animation: "popIn 0.28s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "16px" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={22}
              color={T.accent}
              style={{
                fill: i < filledStars ? T.accent : "transparent",
                opacity: i < filledStars ? 1 : 0.25,
              }}
            />
          ))}
        </div>

        <h2 style={{ fontSize: "19px", fontWeight: 800, color: T.text, margin: "0 0 6px", fontFamily: "'Georgia', serif" }}>
          {perfect ? "Perfect!" : "Well Done"}
        </h2>
        <p style={{ fontSize: "13px", color: T.textMuted, margin: "0 0 22px" }}>
          {score}/{total} correct
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 16px", borderRadius: "14px", background: T.accentBg, border: `1px solid ${T.accent}30`,
          }}>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: T.text }}>XP earned</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: T.accent }}>+{xpEarned}</span>
          </div>

          {streak > 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 16px", borderRadius: "14px", background: T.surface, border: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: "6px" }}>
                <Flame size={14} color={T.accent} style={{ fill: T.accent }} /> Streak saved
              </span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: T.text }}>{streak}d</span>
            </div>
          )}

          {leveledUp && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "11px 16px", borderRadius: "14px", background: "#000", color: "#fff",
            }}>
              <TrendingUp size={14} color={T.accent} />
              <span style={{ fontSize: "12.5px", fontWeight: 700 }}>Level Up!</span>
            </div>
          )}
        </div>

        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          onClick={onContinue}
          style={{ width: "100%", padding: "13px", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer", ...primaryBtn() }}
        >
          Continue
        </button>
      </div>
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default RewardModal;