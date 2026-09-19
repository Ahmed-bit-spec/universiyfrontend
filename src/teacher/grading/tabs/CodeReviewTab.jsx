import React from "react";
import { Code2, Terminal } from "lucide-react";

export default function CodeReviewTab({ submission }) {
  const codeAnswers = submission?.answers?.filter(
    (a) => ["lab", "programming"].includes(a.questionType || a.type)
  ) || [];
  const terminalAnswers = submission?.answers?.filter(
    (a) => ["os_linux", "os_windows"].includes(a.questionType || a.type)
  ) || [];

  if (codeAnswers.length === 0 && terminalAnswers.length === 0) {
    return <EmptyState message="No programming answers in this submission." />;
  }

  return (
    <div className="space-y-6">
      {codeAnswers.map((ans, idx) => {
        const codeStr = typeof ans.answer === "string" ? ans.answer
          : (typeof ans.answer === "object" && ans.answer
            ? (ans.answer.code || JSON.stringify(ans.answer, null, 2))
            : "(no code)");

        return (
          <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-zinc-800">
              <Code2 className="w-4 h-4 text-[#2C2DE0]" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Q{idx + 1}: {ans.questionText?.substring(0, 80)}
                </p>
                <p className="text-xs text-gray-500">{ans.questionType || ans.type}</p>
              </div>
            </div>

            {/* Code editor (read-only) */}
            <div className="p-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 dark:bg-zinc-950">
                <span className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-70" />
                <span className="text-xs text-zinc-400 ml-2 font-mono">{ans.answer?.langId || ans.questionType || "code"}</span>
              </div>
              <pre className="p-4 text-sm font-mono text-emerald-400 bg-zinc-900 dark:bg-zinc-950 overflow-auto max-h-80 leading-relaxed">
                {codeStr}
              </pre>
            </div>

            {/* Output panels */}
            {(ans.codeOutput || ans.expectedOutput) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-100 dark:border-zinc-800">
                {ans.codeOutput && (
                  <div className="p-4 border-r border-gray-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Student Terminal / Console Output</p>
                    <pre className="text-xs font-mono text-emerald-400 bg-zinc-950 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                      {ans.codeOutput}
                    </pre>
                  </div>
                )}
                {ans.expectedOutput && (
                  <div className="p-4">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">Expected Test Output</p>
                    <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                      {ans.expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {terminalAnswers.length > 0 && terminalAnswers.map((ans, idx) => (
        <div key={`terminal-${idx}`} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-zinc-800">
            <Terminal className="w-4 h-4 text-[#2C2DE0]" />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Q{codeAnswers.length + idx + 1}: {ans.questionText?.substring(0, 80)}
              </p>
              <p className="text-xs text-gray-500">{ans.questionType || ans.type}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              This is an interactive terminal sandbox submission. The student work is preserved in the recorded session and shown below.
            </p>
            {ans.codeOutput && (
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <div className="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
                  CONSOLE EXECUTION LOGS
                </div>
                <pre className="p-3 text-xs font-mono text-emerald-400 bg-zinc-950 overflow-auto max-h-40 whitespace-pre-wrap">
                  {ans.codeOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
