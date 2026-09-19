import React from "react";
import { Terminal } from "lucide-react";

export default function TerminalTab({ submission }) {
  const terminalAnswers = submission?.answers?.filter(
    (a) => a.codeOutput && a.codeOutput.trim()
  ) || [];

  if (terminalAnswers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No terminal output recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {terminalAnswers.map((ans, idx) => (
        <div key={idx} className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-700">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
            <span className="w-3 h-3 rounded-full bg-[#2C2DE0] opacity-70" />
            <span className="text-xs text-zinc-400 ml-2">
              Q{idx + 1}: {ans.questionText?.substring(0, 50) || "Terminal Output"}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-[#2C2DE0] overflow-auto max-h-72 leading-relaxed">
            {ans.codeOutput}
          </pre>
        </div>
      ))}
    </div>
  );
}
