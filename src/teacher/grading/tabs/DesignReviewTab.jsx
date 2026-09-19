import React, { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export default function DesignReviewTab({ submission }) {
  const [viewport, setViewport] = useState("desktop");

  const designAns = submission?.answers?.filter(
    (a) => ["design_lab", "html_css_js", "react_project", "ui_design"].includes(a.questionType || a.type)
  ) || [];

  const widths = { desktop: "100%", tablet: "768px", mobile: "375px" };

  if (designAns.length === 0) {
    return <EmptyState message="No design/HTML answers in this submission." />;
  }

  return (
    <div className="space-y-6">
      {/* Viewport selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Viewport</span>
        {[
          { id: "desktop", icon: Monitor, label: "Desktop" },
          { id: "tablet", icon: Tablet, label: "Tablet" },
          { id: "mobile", icon: Smartphone, label: "Mobile" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setViewport(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${viewport === id
                ? "bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {designAns.map((ans, idx) => {
        // Handle design_lab questions - show image
        if ((ans.questionType || ans.type) === "design_lab") {
          const imageUrl = ans.answer?.designImageUrl || ans.fileUrls?.[0];
          const designId = ans.answer?.designId;

          return (
            <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Q{idx + 1}: {ans.questionText?.substring(0, 80)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-950">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Design Q${idx + 1}`}
                    className="w-full h-auto max-h-96 rounded-lg border border-gray-200 dark:border-zinc-700 object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-400 text-sm bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                    No design image available
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Handle HTML/CSS/React design answers
        const html = typeof ans.answer === "string" ? ans.answer : "";
        const htmlContent = typeof ans.answer === "object" && ans.answer !== null
          ? (ans.answer.html || ans.answer.code || "")
          : html;

        const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

        return (
          <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Q{idx + 1}: {ans.questionText?.substring(0, 80)}
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 flex justify-center">
              <div
                className="bg-white rounded-lg shadow-lg overflow-auto transition-all duration-300"
                style={{ width: widths[viewport], maxWidth: "100%", height: "400px" }}
              >
                {htmlContent ? (
                  <iframe
                    srcDoc={htmlContent}
                    title={`Design preview Q${idx + 1}`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No HTML/CSS content submitted
                  </div>
                )}
              </div>
            </div>

            {/* Source code */}
            {htmlContent && (
              <details className="border-t border-gray-100 dark:border-zinc-800">
                <summary className="px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  View Source Code
                </summary>
                <pre className="p-4 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-950 overflow-auto max-h-64">
                  {htmlContent}
                </pre>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
