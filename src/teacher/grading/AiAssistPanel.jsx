import React from "react";
import { Sparkles, ThumbsUp, AlertTriangle, BookOpen, CheckCircle2 } from "lucide-react";

/**
 * AiAssistPanel — displays Gemini suggestions for a single question.
 * Teacher can optionally apply suggested score or feedback.
 */
export default function AiAssistPanel({ suggestions, maxMarks, onApplyScore, onApplyFeedback }) {
  if (!suggestions) return null;

  const {
    summary, strengths = [], weaknesses = [], missingConcepts = [],
    suggestedScore, suggestedFeedback, codeReview,
  } = suggestions;

  return (
    <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400">AI Grading Assistant</h4>
        <span className="ml-auto text-xs text-purple-500">Suggestions only — you decide</span>
      </div>

      {summary && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {strengths.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#2C2DE0] dark:text-[#2C2DE0] flex items-center gap-1 mb-1">
              <ThumbsUp className="w-3 h-3" /> Strengths
            </p>
            <ul className="text-xs space-y-0.5 text-gray-600 dark:text-gray-400">
              {strengths.slice(0, 3).map((s, i) => <li key={i} className="truncate">• {s}</li>)}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div>
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Weaknesses
            </p>
            <ul className="text-xs space-y-0.5 text-gray-600 dark:text-gray-400">
              {weaknesses.slice(0, 3).map((w, i) => <li key={i} className="truncate">• {w}</li>)}
            </ul>
          </div>
        )}
        {missingConcepts.length > 0 && (
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" /> Missing
            </p>
            <ul className="text-xs space-y-0.5 text-gray-600 dark:text-gray-400">
              {missingConcepts.slice(0, 3).map((c, i) => <li key={i} className="truncate">• {c}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Code review */}
      {codeReview && (
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-xs space-y-1">
          {codeReview.logic && <p><span className="font-bold text-gray-700 dark:text-gray-300">Logic: </span>{codeReview.logic}</p>}
          {codeReview.style && <p><span className="font-bold text-gray-700 dark:text-gray-300">Style: </span>{codeReview.style}</p>}
          {codeReview.efficiency && <p><span className="font-bold text-gray-700 dark:text-gray-300">Efficiency: </span>{codeReview.efficiency}</p>}
          {codeReview.bugs?.length > 0 && (
            <div>
              <span className="font-bold text-red-600 dark:text-red-400">Bugs: </span>
              {codeReview.bugs.join("; ")}
            </div>
          )}
        </div>
      )}

      {/* Apply buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-200 dark:border-purple-500/20">
        {suggestedScore !== undefined && (
          <button
            onClick={() => onApplyScore(suggestedScore)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            Apply Score ({suggestedScore}/{maxMarks})
          </button>
        )}
        {suggestedFeedback && (
          <button
            onClick={() => onApplyFeedback(suggestedFeedback)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-colors"
          >
            Apply Feedback
          </button>
        )}
      </div>
    </div>
  );
}
