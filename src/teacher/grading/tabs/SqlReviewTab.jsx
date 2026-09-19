import React from "react";
import { Database } from "lucide-react";

export default function SqlReviewTab({ submission }) {
  const sqlAnswers = submission?.answers?.filter(
    (a) => ["sql", "networking_lab"].includes(a.questionType || a.type)
  ) || [];

  if (sqlAnswers.length === 0) {
    return <EmptyState message="No SQL answers in this submission." />;
  }

  return (
    <div className="space-y-6">
      {sqlAnswers.map((ans, idx) => {
        const query = typeof ans.answer === "string" ? ans.answer : "";

        return (
          <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-zinc-800">
              <Database className="w-4 h-4 text-cyan-500" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Q{idx + 1}: {ans.questionText?.substring(0, 80)}
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Schema */}
              {ans.sqlSchema && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Schema</p>
                  <pre className="text-xs font-mono text-blue-300 bg-zinc-900 dark:bg-zinc-950 p-3 rounded-lg overflow-auto max-h-32">
                    {ans.sqlSchema}
                  </pre>
                </div>
              )}

              {/* Student query */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-500 mb-2">Student's Query</p>
                <pre className="text-sm font-mono text-cyan-300 bg-zinc-900 dark:bg-zinc-950 p-4 rounded-lg overflow-auto max-h-40">
                  {query || "(no query submitted)"}
                </pre>
              </div>

              {/* Results comparison */}
              {(ans.codeOutput || ans.expectedOutput) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Query Result</p>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-48">
                      {ans.codeOutput || "No result"}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2C2DE0] mb-2">Expected Result</p>
                    <div className="bg-[#2C2DE0] dark:bg-[#2C2DE0]/5 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-48">
                      {ans.expectedOutput || "(not specified)"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
