// components/LivePreview.jsx
// Stable HTML/CSS/JS live preview, shared by the Coding Lab (when the
// student picks HTML/CSS/JS) and the Design Lab student player.
//
// Stability choices, explained:
// - Uses a single <iframe srcDoc="...">, debounced, instead of rebuilding
//   the iframe or calling contentWindow.document.write on every keystroke.
//   Rebuilding too often is what usually makes these previews feel flaky.
// - sandbox="allow-scripts" ONLY (no allow-same-origin). Student code can
//   run JS, but can never read your app's cookies/localStorage or make
//   same-origin requests against your backend.
// - Runtime JS errors are caught and shown inline instead of silently
//   breaking the preview.
import React, { useEffect, useState } from "react";

export default function LivePreview({ html = "", css = "", js = "", debounceMs = 400 }) {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = `<!DOCTYPE html>
<html>
<head><style>${css}</style></head>
<body>
${html}
<script>
  window.onerror = function(msg) {
    document.body.insertAdjacentHTML('beforeend',
      '<pre style="color:#dc2626;background:#fef2f2;padding:8px;font-size:12px;border-top:1px solid #fecaca;position:fixed;bottom:0;left:0;right:0;margin:0;white-space:pre-wrap;">' + msg + '</pre>');
    return true;
  };
  try {
    ${js}
  } catch (e) {
    window.onerror(e.message);
  }
<\/script>
</body>
</html>`;
      setSrcDoc(doc);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [html, css, js, debounceMs]);

  return (
    <iframe
      title="live-preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className="w-full h-full min-h-[300px] bg-white dark:bg-gray-900 border-0"
    />
  );
}