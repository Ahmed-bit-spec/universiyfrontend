import React from "react";
import { StickyNote, AlertCircle } from "lucide-react";

export default function TeacherNotesTab({ grades, onUpdateGrade, answers }) {
  if (answers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No answers to add notes for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold">Private Notes</p>
          <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
            Notes entered here are strictly for teachers/graders and will never be shown to students. Use them to log grading rationale or rubric exceptions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {answers.map((ans, idx) => {
          const qid = ans.questionId?.toString?.() || ans.questionId;
          const g   = grades[qid] || {};

          return (
            <div key={qid} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>Question {idx + 1} ({ans.questionType || ans.type})</span>
                <span>Score: {g.manualScore || ans.autoScore || 0} / {ans.maxMarks}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{ans.questionText}</p>
              <textarea
                rows={3}
                value={g.privateNotes ?? ""}
                onChange={(e) => onUpdateGrade(qid, "privateNotes", e.target.value)}
                placeholder="Enter private grading notes, edge cases, or exception reasons..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-[#2C2DE0] outline-none resize-y"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
