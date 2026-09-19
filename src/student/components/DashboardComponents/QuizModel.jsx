// components/QuizModal.jsx — Uniso E-Library
// Post-chapter quiz. Generic question shape so it can be filled either from
// a static question bank or from AIPanel's existing callAI() using the
// "quiz" quick action (ask it to return strict JSON — see note at bottom).
//
// questions shape:
//   [{ question: "What is AI?", options: ["A","B","C","D"], correctIndex: 2 }, ...]
//
// Usage from BookReader.jsx:
//   {showQuiz && (
//     <QuizModal
//       T={T}
//       questions={quizQuestions}
//       onFinish={(score, total) => {
//         const xp = completeQuiz(score, total); // from useGamification
//         setShowQuiz(false);
//         setReward({ score, total, xpEarned: xp });
//       }}
//       onClose={() => setShowQuiz(false)}
//     />
//   )}

import { useState } from "react";
import { X, Check } from "lucide-react";

const PRIMARY_GREEN = "#2C2DE0";
const PRIMARY_GREEN_SHADOW = "#1E1FAA";
const primaryBtn = () => ({
  background: PRIMARY_GREEN, color: "#fff", border: "none",
  boxShadow: `0 4px 0 ${PRIMARY_GREEN_SHADOW}`, transition: "all 0.12s",
});

const QuizModal = ({ T, questions = [], onFinish, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions.length) return null;
  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const choose = (i) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      onFinish(score + (picked === q.correctIndex && !revealed ? 1 : 0), questions.length);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: T.surface, borderRadius: "22px", border: `1px solid ${T.border}`,
        padding: "24px 22px", maxWidth: "420px", width: "100%", boxShadow: T.shadow,
      }}>
        {/* Progress + close */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ flex: 1, height: "6px", background: T.border, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: T.accent, borderRadius: "3px",
              width: `${((idx + (revealed ? 1 : 0)) / questions.length) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
          <span style={{ fontSize: "11.5px", fontWeight: 700, color: T.textMuted, flexShrink: 0 }}>
            {idx + 1}/{questions.length}
          </span>
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint }}>
            <X size={15} />
          </button>
        </div>

        <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: T.text, lineHeight: 1.5, margin: "0 0 18px" }}>
          {q.question}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "18px" }}>
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isPicked = i === picked;
            let bg = T.surface, border = T.border, color = T.text;
            if (revealed && isCorrect) { bg = T.accentBg; border = T.accent; color = T.accent; }
            else if (revealed && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.08)"; border = "#ef4444"; color = "#ef4444"; }

            return (
              <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                style={{
                  textAlign: "left", padding: "12px 14px", borderRadius: "12px",
                  border: `1.5px solid ${border}`, background: bg, color,
                  fontSize: "13.5px", fontWeight: 600, cursor: revealed ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.12s",
                }}
              >
                <span>{opt}</span>
                {revealed && isCorrect && <Check size={14} />}
              </button>
            );
          })}
        </div>

        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          onClick={next}
          disabled={!revealed}
          style={{
            width: "100%", padding: "13px", borderRadius: "14px", fontSize: "14px", fontWeight: 700,
            ...(revealed ? primaryBtn() : { background: T.border, color: T.textFaint, border: "none" }),
            cursor: revealed ? "pointer" : "not-allowed",
          }}
        >
          {isLast ? "Finish" : "Next Question"}
        </button>
      </div>
    </div>
  );
};

export default QuizModal;

// ── Generating questions from the current page via your existing AI panel ──
// AIPanel.jsx already has a `callAI(messages, systemPrompt)` helper hitting
// POST /api/v1/ai/chat. To turn that into `questions` for this modal, ask it
// for strict JSON instead of markdown, e.g.:
//
//   const reply = await callAI(
//     [{ role: "user", content: `Create 5 multiple-choice questions from this page:\n"""${pageText}"""` }],
//     `Respond with ONLY a JSON array, no markdown, no commentary. Shape:
//      [{"question": "...", "options": ["...","...","...","..."], "correctIndex": 0}]`
//   );
//   const questions = JSON.parse(reply.replace(/```json|```/g, "").trim());