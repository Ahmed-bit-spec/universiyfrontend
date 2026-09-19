// QuizWithOwl.jsx — example wiring: owl reacts to real answers, like Duolingo.
// Drop this next to InteractiveOwlMascot.jsx. Swap MOCK_QUESTIONS for your
// real lesson data / API call.

import { useState } from "react";
import { Check, X, Flame } from "lucide-react";
import { InteractiveOwlMascot, useOwlReaction } from "./interactiveOwl";

const PRIMARY_BTN =
  "bg-[#2C2DE0] text-white shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150";

const MOCK_QUESTIONS = [
  {
    id: 1,
    prompt: "What was the main idea of this chapter?",
    options: [
      "The character overcomes fear through small daily habits",
      "The character moves to a new city",
      "The book ends unresolved",
      "None of the above",
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    prompt: "Which of these best describes a learning streak?",
    options: [
      "Reading once a month",
      "Consecutive days of activity",
      "Total XP earned",
      "Number of books owned",
    ],
    correctIndex: 1,
  },
];

const QuizWithOwl = ({ onComplete }) => {
  const { mood, message, react } = useOwlReaction();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(6); // e.g. loaded from user profile

  const question = MOCK_QUESTIONS[qIndex];
  const isLast = qIndex === MOCK_QUESTIONS.length - 1;

  const handleSelect = (idx) => {
    if (locked) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null || locked) return;
    setLocked(true);

    const isCorrect = selected === question.correctIndex;

    if (isCorrect) {
      setXp((x) => x + 20);
      react("happy", "Nice! +20 XP");
    } else {
      react("sad", "Not quite — check the explanation");
    }
  };

  const handleContinue = () => {
    setLocked(false);
    setSelected(null);

    if (isLast) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      // Celebrate the streak milestone, then hand off to the parent screen.
      react("celebrate", `🔥 ${newStreak} day streak!`, 2200);
      setTimeout(() => onComplete?.({ xp }), 2200);
    } else {
      setQIndex((i) => i + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 px-5 py-8">
      {/* Owl reacts live to the last action */}
      <div className="owl-int-wrap">
        <InteractiveOwlMascot size={160} mood={mood} message={message} />
      </div>

      {/* Streak + XP chips, Duolingo-style */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-black">
          <Flame size={13} className="text-[#2C2DE0]" />
          {streak} day streak
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C2DE0] border border-[#2C2DE0] text-[#2C2DE0] text-xs font-black">
          +{xp} XP
        </div>
      </div>

      {/* Progress bar across questions */}
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-[#2C2DE0] rounded-full transition-all duration-300"
          style={{ width: `${((qIndex + (locked ? 1 : 0)) / MOCK_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="w-full">
        <h2 className="text-base font-black text-black mb-4 leading-snug">{question.prompt}</h2>

        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrectOpt = idx === question.correctIndex;

            let stateClass = "border-gray-200 bg-white text-black hover:border-[#2C2DE0]";
            if (locked && isCorrectOpt) {
              stateClass = "border-[#2C2DE0] bg-[#2C2DE0] text-white";
            } else if (locked && isSelected && !isCorrectOpt) {
              stateClass = "border-red-400 bg-red-50 text-red-600";
            } else if (!locked && isSelected) {
              stateClass = "border-[#2C2DE0] bg-[#2C2DE0] text-white";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={locked}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-bold text-left transition-all ${stateClass}`}
              >
                <span>{opt}</span>
                {locked && isCorrectOpt && <Check size={16} className="text-[#2C2DE0] shrink-0" />}
                {locked && isSelected && !isCorrectOpt && <X size={16} className="text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary action */}
      {!locked ? (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={`w-full py-3.5 rounded-2xl text-sm font-black ${PRIMARY_BTN} disabled:opacity-40 disabled:pointer-events-none`}
        >
          Check
        </button>
      ) : (
        <button
          onClick={handleContinue}
          className={`w-full py-3.5 rounded-2xl text-sm font-black ${PRIMARY_BTN}`}
        >
          {isLast ? "Finish lesson" : "Continue"}
        </button>
      )}
    </div>
  );
};

export default QuizWithOwl;