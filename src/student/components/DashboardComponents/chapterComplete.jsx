// components/ChapterComplete.jsx — Uniso E-Library
// Shown instead of a plain "Next Page" tap when the reader crosses a chapter
// boundary (or a "session" of N pages, if the PDF has no chapter markers).
// Matches BookReader.jsx's inline-style theme system (T) so it drops in as
// an overlay without needing Tailwind.
//
// Usage from BookReader.jsx:
//   const [chapterComplete, setChapterComplete] = useState(null);
//   // when the reader crosses a chapter boundary:
//   setChapterComplete({ pagesRead, minutes, xpEarned });
//   ...
//   {chapterComplete && (
//     <ChapterComplete
//       T={T}
//       pagesRead={chapterComplete.pagesRead}
//       minutes={chapterComplete.minutes}
//       xpEarned={chapterComplete.xpEarned}
//       onContinue={() => setChapterComplete(null)}
//       onTakeQuiz={() => { setChapterComplete(null); setShowQuiz(true); }}
//     />
//   )}

import { PartyPopper, Clock, BookOpen, Zap } from "lucide-react";

const PRIMARY_GREEN = "#2C2DE0";
const PRIMARY_GREEN_SHADOW = "#1E1FAA";
const primaryBtn = (pressed = false) => ({
  background: PRIMARY_GREEN,
  color: "#fff",
  border: "none",
  boxShadow: pressed ? `0 2px 0 ${PRIMARY_GREEN_SHADOW}` : `0 4px 0 ${PRIMARY_GREEN_SHADOW}`,
  transition: "all 0.12s",
});

const Stat = ({ icon: Icon, label, value, T }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
    <div style={{
      width: "40px", height: "40px", borderRadius: "12px",
      background: T.accentBg, border: `1px solid ${T.accent}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={17} color={T.accent} />
    </div>
    <span style={{ fontSize: "16px", fontWeight: 800, color: T.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    <span style={{ fontSize: "10.5px", color: T.textMuted, fontWeight: 600 }}>{label}</span>
  </div>
);

const ChapterComplete = ({ T, pagesRead, minutes, xpEarned, onContinue, onTakeQuiz, hasQuiz = true }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px", animation: "fadeIn 0.2s ease",
  }}>
    <div style={{
      background: T.surface, borderRadius: "24px", border: `1px solid ${T.border}`,
      padding: "32px 28px 24px", maxWidth: "360px", width: "100%",
      textAlign: "center", boxShadow: T.shadow,
    }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 14px",
        background: T.accentBg, border: `1px solid ${T.accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <PartyPopper size={26} color={T.accent} />
      </div>

      <h2 style={{ fontSize: "18px", fontWeight: 800, color: T.text, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>
        Chapter Complete
      </h2>
      <p style={{ fontSize: "12.5px", color: T.textMuted, margin: "0 0 22px" }}>
        Nice work — here's what you covered.
      </p>

      <div style={{ display: "flex", gap: "6px", marginBottom: "26px" }}>
        <Stat icon={BookOpen} label="pages" value={pagesRead} T={T} />
        <Stat icon={Clock} label="min" value={minutes} T={T} />
        <Stat icon={Zap} label="XP" value={`+${xpEarned}`} T={T} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {hasQuiz && (
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            onClick={onTakeQuiz}
            style={{ ...primaryBtn(), padding: "13px", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            Take Quiz
          </button>
        )}
        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          onClick={onContinue}
          style={{
            padding: "12px", borderRadius: "14px", fontSize: "13.5px", fontWeight: 700,
            background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer",
          }}
        >
          Continue Reading
        </button>
      </div>
    </div>
    <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
  </div>
);

export default ChapterComplete;