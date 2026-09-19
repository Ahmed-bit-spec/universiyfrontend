import React from "react";
import { Send, Loader2 } from "lucide-react";

/**
 * PublishButton — confirmation-aware publish button.
 * Shows a two-step confirm flow before publishing.
 */
export default function PublishButton({ isPublished, isGraded, loading, onPublish }) {
  const [confirming, setConfirming] = React.useState(false);

  if (isPublished) {
    return (
      <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#2C2DE0] dark:text-[#2C2DE0] bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 rounded-lg">
        ✓ Published
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        disabled={!isGraded || loading}
        title={!isGraded ? "Finalize grading first" : "Publish result to student"}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white rounded-lg transition-colors disabled:opacity-40"
      >
        <Send className="w-3.5 h-3.5" />
        Publish
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Publish result?</span>
      <button
        onClick={() => setConfirming(false)}
        className="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
      <button
        onClick={() => { setConfirming(false); onPublish(); }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        Confirm
      </button>
    </div>
  );
}
