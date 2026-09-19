import React from "react";

export default function StandardQuestion({ question, value, onChange }) {
  if (question.type === "mcq") {
    return (
      <div className="space-y-3">
        {question.options?.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${value === opt
                ? "border-[#2C2DE0] bg-[#2C2DE0] dark:border-[#2C2DE0] dark:bg-[#2C2DE0]/20"
                : "border-neutral-200 hover:border-[#2C2DE0] dark:border-neutral-700 dark:hover:border-neutral-600"}
            `}
          >
            <input
              type="radio"
              name={`q-${question._id}`}
              value={opt}
              checked={value === opt}
              onChange={e => onChange(e.target.value)}
              className="w-5 h-5 text-[#2C2DE0] border-neutral-300 focus:ring-[#2C2DE0]"
            />
            <span className="text-lg">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "truefalse") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {["True", "False"].map(opt => (
          <label
            key={opt}
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all text-center
              ${value === (opt === "True")
                ? "border-[#2C2DE0] bg-[#2C2DE0] dark:border-[#2C2DE0] dark:bg-[#2C2DE0]/20"
                : "border-neutral-200 hover:border-[#2C2DE0] dark:border-neutral-700 dark:hover:border-neutral-600"}
            `}
          >
            <input
              type="radio"
              name={`q-${question._id}`}
              checked={value === (opt === "True")}
              onChange={() => onChange(opt === "True")}
              className="hidden"
            />
            <span className="font-display text-2xl font-semibold">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "essay") {
    return (
      <div className="space-y-2">
        <textarea
          className="w-full h-64 border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 rounded-xl p-4 focus:ring-[#2C2DE0] focus:border-[#2C2DE0] resize-none"
          placeholder="Type your answer here…"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
        <div className="text-right text-sm text-neutral-500">Word limit: {question.wordLimit}</div>
      </div>
    );
  }

  return null;
}