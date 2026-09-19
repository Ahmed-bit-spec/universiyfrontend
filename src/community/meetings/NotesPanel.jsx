import React, { useState, useCallback, useEffect } from "react";
import { Bold, Italic, Underline, Code, List, Heading1, Heading2, Table, Download, Eye, Edit3, Lock } from "lucide-react";
import socket from "@/socket.js";
import { toast } from "sonner";

const TOOLBAR_ACTIONS = [
  { id: "h1", icon: Heading1, label: "Heading 1", action: (text, sel) => insertWrap(text, sel, "# ", "") },
  { id: "h2", icon: Heading2, label: "Heading 2", action: (text, sel) => insertWrap(text, sel, "## ", "") },
  { id: "bold", icon: Bold, label: "Bold", action: (text, sel) => insertWrap(text, sel, "**", "**") },
  { id: "italic", icon: Italic, label: "Italic", action: (text, sel) => insertWrap(text, sel, "_", "_") },
  { id: "underline", icon: Underline, label: "Underline", action: (text, sel) => insertWrap(text, sel, "<u>", "</u>") },
  { id: "code", icon: Code, label: "Code", action: (text, sel) => insertWrap(text, sel, "`", "`") },
  { id: "list", icon: List, label: "List", action: (text, sel) => insertWrap(text, sel, "- ", "") },
  { id: "table", icon: Table, label: "Insert table", action: (text, sel) => insertTable(text, sel) },
];

function insertWrap(text, sel, before, after) {
  const { start, end } = sel;
  const selected = text.slice(start, end);
  return text.slice(0, start) + before + selected + after + text.slice(end);
}

function insertTable(text, sel) {
  const table = "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n";
  return text.slice(0, sel.start) + table + text.slice(sel.end);
}

function renderMarkdown(text = "") {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-white mb-2 mt-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mb-2 mt-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white/90 mb-1.5 mt-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic text-white/90">$1</em>')
    .replace(/<u>(.+?)<\/u>/g, '<u class="underline text-white/90">$1</u>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 text-[#2C2DE0] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-white/80 text-sm list-disc list-inside ml-2">$1</li>')
    .replace(/\|(.+)\|/g, (line) => {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) return "";
      return `<tr>${cells.map((c) => `<td class="border border-white/10 px-3 py-1.5 text-white/80 text-xs">${c}</td>`).join("")}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>)/gs, '<table class="w-full border-collapse mt-2 mb-2">$1</table>')
    .replace(/\n/g, '<br/>');
}

const DEFAULT_NOTES = `# Class Notes

## Overview
Welcome to the collaborative notes editor. Use the toolbar above to format your text.

## Key Topics
- Topic 1: Introduction
- Topic 2: Core concepts
- Topic 3: Examples and exercises

## Code Example
\`console.log("UniCore Live Class")\`

---
*Notes sync in real-time for all presenters*
`;

export function NotesPanel({ canEdit = true, meetingCode, notesText, onNotesChange }) {
  const [mode, setMode] = useState("edit"); // "edit" | "preview"
  const [content, setContent] = useState(notesText || DEFAULT_NOTES);
  const textareaRef = React.useRef(null);
  const syncTimerRef = React.useRef(null);

  // Update content state when notesText prop changes
  useEffect(() => {
    if (notesText !== undefined && notesText !== content) {
      setContent(notesText);
    }
  }, [notesText]);

  // Receive remote note updates
  useEffect(() => {
    const handler = ({ text }) => {
      setContent(text);
      if (onNotesChange) onNotesChange(text);
    };
    socket.on("meeting:notes-updated", handler);
    return () => socket.off("meeting:notes-updated", handler);
  }, [onNotesChange]);

  const broadcastNotes = useCallback((text) => {
    if (!meetingCode) return;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      socket.emit("meeting:relay-event", { event: "meeting:notes-updated", payload: { text } });
    }, 600); // debounce 600ms
  }, [meetingCode]);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (onNotesChange) onNotesChange(val);
    broadcastNotes(val);
  };

  const applyAction = (action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = { start: ta.selectionStart, end: ta.selectionEnd };
    const newText = action(content, sel);
    setContent(newText);
    if (onNotesChange) onNotesChange(newText);
    broadcastNotes(newText);
    // Restore cursor
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(sel.start, sel.end);
    });
  };

  const exportNotes = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `meeting_notes_${meetingCode ?? "class"}.md`;
    a.click();
    toast.success("Notes downloaded as Markdown file");
  };

  return (
    <div className="flex flex-col h-full bg-black dark:bg-black text-white dark:text-white rounded-lg m-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 shrink-0 bg-black/90">
        {TOOLBAR_ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => applyAction(a.action)}
            disabled={!canEdit || mode === "preview"}
            title={a.label}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <a.icon size={13} />
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          {/* Toggle edit/preview */}
          <div className="flex items-center bg-[#2C2DE0]/10 rounded-xl p-0.5">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mode === "edit" ? "bg-[#2C2DE0]/20 text-white" : "text-white/50"}`}
            >
              <Edit3 size={11} /> Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mode === "preview" ? "bg-[#2C2DE0]/20 text-white" : "text-white/50"}`}
            >
              <Eye size={11} /> Preview
            </button>
          </div>

          <button
            onClick={exportNotes}
            title="Export as Markdown"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Edit / Preview area */}
      <div className="flex-1 overflow-hidden relative bg-black">
        {mode === "edit" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            readOnly={!canEdit}
            placeholder="Start taking notes…"
            className="w-full h-full p-4 bg-black/80 text-white/95 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#2C2DE0]/50 resize-none placeholder:text-white/30"
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
          />
        ) : (
          <div
            className="w-full h-full p-4 overflow-y-auto text-white/90 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}

        {!canEdit && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/30 border border-amber-500/40 px-2 py-1 rounded-lg text-amber-300 text-[10px] font-bold">
            <Lock size={10} /> View only
          </div>
        )}
      </div>
    </div>
  );
}
