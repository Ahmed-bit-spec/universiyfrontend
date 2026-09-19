// src/components/community/WritePostModal.jsx
// Full-screen modal write experience — Facebook-style: photo / video / document
// attachments (multiple), media preview grid, PDFs shown as downloadable file cards.
// Includes a Medium-style formatting toolbar (bold / italic / link) that wraps
// the current textarea selection with **bold**, *italic*, or [text](url)
// markdown-lite syntax. Rendered later via renderRichText.
//
// FIX applied: a single attached image/video was force-cropped into a square
// (same treatment as a multi-image grid), which mangled tall or wide photos.
// A single attachment now keeps its natural aspect ratio, capped at a max
// preview height; the square-crop grid only kicks in for 2+ attachments.

import React, { useState, useRef, useEffect } from "react";
import { X, Image, Video, FileText, Tag as TagIcon, Send, Loader2, Bold, Italic, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { createPost } from "@/api/Communityapi";
import { Avatar, BTN_PRIMARY } from "./ui";

const SEMESTER_TAGS = ["Sem1", "Sem2", "Sem3", "Sem4", "Sem5", "Sem6", "Sem7", "Sem8", "General"];

const formatSize = (bytes) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

let attachmentSeq = 0;
const nextId = () => `att_${Date.now()}_${attachmentSeq++}`;

const WritePostModal = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle]             = useState("");
  const [content, setContent]         = useState("");
  const [tags, setTags]               = useState([]);
  const [tagInput, setTagInput]       = useState("");
  const [attachments, setAttachments] = useState([]); // { id, type: 'image'|'video'|'pdf', file, url, name, size }
  const [posting, setPosting]         = useState(false);
  const [error, setError]             = useState("");

  const textareaRef   = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  const growTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    } else {
      setTitle(""); setContent(""); setTags([]); setTagInput(""); setError("");
      setAttachments((prev) => {
        prev.forEach((a) => a.url && URL.revokeObjectURL(a.url));
        return [];
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((x) => x !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const addFiles = (fileList, type) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const mapped = files.map((file) => ({
      id: nextId(),
      type,
      file,
      name: file.name,
      size: file.size,
      url: type === "pdf" ? null : URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...mapped]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found?.url) URL.revokeObjectURL(found.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  // ── Formatting toolbar helpers ────────────────────────────────────────────
  // Wraps the current textarea selection with `before`/`after` markers
  // (e.g. "**" for bold, "*" for italic). If nothing is selected, inserts a
  // placeholder word so the user has something to type over.
  const wrapSelection = (before, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = content.slice(s, e) || "text";
    const next = content.slice(0, s) + before + selected + after + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + selected.length);
      growTextarea();
    });
  };

  const insertLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const url = window.prompt(t["write.linkPrompt"] ?? "Link URL (https://…)");
    if (!url?.trim()) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const label = content.slice(s, e) || (t["write.linkText"] ?? "link text");
    const markup = `[${label}](${url.trim()})`;
    const next = content.slice(0, s) + markup + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = s + markup.length;
      ta.setSelectionRange(cursor, cursor);
      growTextarea();
    });
  };

  const mediaAttachments = attachments.filter((a) => a.type === "image" || a.type === "video");
  const pdfAttachments = attachments.filter((a) => a.type === "pdf");

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      setError(t["write.errorEmpty"] ?? "Write something before publishing.");
      return;
    }
    if (posting) return;
    setPosting(true);
    setError("");
    try {
      const data = await createPost({
        title,
        content,
        tags,
        attachments,
      });
      if (data.success) {
        onCreated?.(data.post);
        onClose();
      } else {
        setError(t["feed.errorPost"] ?? "Couldn't publish. Please try again.");
      }
    } catch {
      setError(t["feed.errorPost"] ?? "Couldn't publish. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  if (!open) return null;

  const gridClass = mediaAttachments.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-white dark:bg-black overflow-y-auto">
      {/* Header bar */}
      <div
        className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 h-14 border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-black"
        style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
      >
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} photo={user?.photo} size={30} />
          <div>
            <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-none">
              {user?.name}
            </p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">
              New story
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <p className="text-xs text-red-500 mr-2 hidden sm:block">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && attachments.length === 0) || posting}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold ${BTN_PRIMARY}`}
          >
            {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {posting ? t["write.publishing"] ?? "Publishing…" : t["write.publish"] ?? "Publish"}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        className="w-full max-w-2xl mt-14 px-6 sm:px-10 py-10 pb-24"
        style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}
      >
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t["write.titlePlaceholder"] ?? "Give your story a title…"}
          className="w-full mb-4 text-3xl sm:text-4xl font-black text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none placeholder-gray-200 dark:placeholder-gray-800 leading-tight"
          style={{ fontFamily: "Lora, Charter, Georgia, 'Times New Roman', serif" }}
          maxLength={120}
        />

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 mb-2 -ml-1.5">
          <button
            type="button"
            onClick={() => wrapSelection("**")}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Bold"
            title="Bold"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection("*")}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Italic"
            title="Italic"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Link"
            title="Link"
          >
            <LinkIcon size={15} />
          </button>
          <span className="text-[11px] text-gray-400 ml-2">
            {t["write.formatHint"] ?? "Markers stay visible while typing — they render after you publish."}
          </span>
        </div>

        {/* Content */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); growTextarea(); }}
          placeholder={t["write.contentPlaceholder"] ?? "Tell your story…"}
          className="w-full resize-none bg-transparent border-0 text-[17px] sm:text-[18px] leading-[1.8] text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none"
          style={{
            fontFamily: "Lora, Charter, Georgia, 'Times New Roman', serif",
            minHeight: "160px",
          }}
        />

        {/* Media preview — single attachment keeps its aspect ratio */}
        {mediaAttachments.length === 1 && (
          <div className="relative group mt-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900">
            {mediaAttachments[0].type === "image" ? (
              <img
                src={mediaAttachments[0].url}
                alt=""
                className="w-full max-h-[420px] object-contain mx-auto"
              />
            ) : (
              <video
                src={mediaAttachments[0].url}
                className="w-full max-h-[420px]"
                controls
                playsInline
              />
            )}
            <button
              onClick={() => removeAttachment(mediaAttachments[0].id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Media preview grid — 2+ images & videos, square-cropped */}
        {mediaAttachments.length > 1 && (
          <div className={`grid ${gridClass} gap-1.5 mt-4 rounded-2xl overflow-hidden`}>
            {mediaAttachments.map((att) => (
              <div key={att.id} className="relative group bg-gray-100 dark:bg-gray-900 aspect-square">
                {att.type === "image" ? (
                  <img src={att.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={att.url} className="w-full h-full object-cover" controls playsInline />
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PDF attachments — downloadable file cards */}
        {pdfAttachments.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {pdfAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">{att.name}</p>
                  <p className="text-[11px] text-gray-400">{formatSize(att.size)}</p>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex-shrink-0"
                  aria-label="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Attach actions */}
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#2C2DE0] transition-colors"
          >
            <Image size={16} />
            {t["write.photo"] ?? "Photo"}
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-blue-500 transition-colors"
          >
            <Video size={16} />
            {t["write.video"] ?? "Video"}
          </button>
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-red-500 transition-colors"
          >
            <FileText size={16} />
            {t["write.document"] ?? "Document"}
          </button>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files, "image"); e.target.value = ""; }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files, "video"); e.target.value = ""; }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files, "pdf"); e.target.value = ""; }}
        />

        {/* Tags section */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <TagIcon size={14} className="text-gray-400" />
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              {t["write.tags"] ?? "Tags"}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {SEMESTER_TAGS.map((sem) => (
              <button
                key={sem}
                onClick={() => {
                  if (tags.includes(sem)) removeTag(sem);
                  else if (tags.length < 5) setTags((prev) => [...prev, sem]);
                }}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                  tags.includes(sem)
                    ? "bg-[#2C2DE0] border-[#2C2DE0] text-white shadow-[0_2px_0_#1E1FAA]"
                    : "border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#2C2DE0] hover:text-[#2C2DE0]"
                }`}
              >
                #{sem}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center p-2 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2C2DE0] dark:bg-[#2C2DE0]/40 text-white dark:text-[#2C2DE0] text-[12px] font-semibold"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? (t["write.tagsPlaceholder"] ?? "Add a tag and press Enter") : ""}
                className="flex-1 min-w-[140px] text-[13px] bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none px-1.5 py-0.5"
              />
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{tags.length}/5 tags</p>
          {tags.some((tag) => tag !== "General") && (
            <p className="text-[11px] text-gray-400 mt-1">
              {t["write.tagNotifyHint"] ?? "Students in the tagged semester(s) will be notified when you publish."}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-4 sm:hidden">{error}</p>
        )}
      </div>
    </div>
  );
};

export default WritePostModal;