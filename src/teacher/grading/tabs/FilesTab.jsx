import React from "react";
import { Paperclip, FileText } from "lucide-react";

export default function FilesTab({ submission }) {
  const fileAnswers = submission?.answers?.filter(
    (a) => a.fileUrls?.length > 0 || (a.questionType || a.type) === "file_upload"
  ) || [];

  if (fileAnswers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No file uploads in this submission.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fileAnswers.map((ans, idx) => (
        <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Q{idx + 1}: {ans.questionText?.substring(0, 80)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(ans.fileUrls || []).map((url, fi) => {
              const filename = url.split("/").pop() || `file-${fi + 1}`;
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
              const isPdf   = /\.pdf$/i.test(filename);

              return (
                <a
                  key={fi}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0] transition-colors group"
                >
                  {isImage ? (
                    <img src={url} alt={filename} className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400 group-hover:text-[#2C2DE0] transition-colors" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full text-center">
                    {filename}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
