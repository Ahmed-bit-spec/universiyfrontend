import React, { useState, useRef } from "react";
import { Upload, FileText, Download, Trash2, Eye, File, Film, Image, Archive } from "lucide-react";
import { toast } from "sonner";
import socket from "@/socket.js";

const MAX_SIZE_MB = 50;

const FILE_TYPE_MAP = {
  pdf: { icon: FileText, color: "text-red-400", bg: "bg-red-400/10" },
  docx: { icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  doc: { icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  pptx: { icon: File, color: "text-orange-400", bg: "bg-orange-400/10" },
  ppt: { icon: File, color: "text-orange-400", bg: "bg-orange-400/10" },
  jpg: { icon: Image, color: "text-purple-400", bg: "bg-purple-400/10" },
  jpeg: { icon: Image, color: "text-purple-400", bg: "bg-purple-400/10" },
  png: { icon: Image, color: "text-purple-400", bg: "bg-purple-400/10" },
  gif: { icon: Image, color: "text-purple-400", bg: "bg-purple-400/10" },
  mp4: { icon: Film, color: "text-pink-400", bg: "bg-pink-400/10" },
  mov: { icon: Film, color: "text-pink-400", bg: "bg-pink-400/10" },
  zip: { icon: Archive, color: "text-gray-400", bg: "bg-gray-400/10" },
  rar: { icon: Archive, color: "text-gray-400", bg: "bg-gray-400/10" },
};

function getExt(name = "") { return name.split(".").pop()?.toLowerCase() ?? ""; }
function getFileMeta(name) {
  const ext = getExt(name);
  return FILE_TYPE_MAP[ext] ?? { icon: File, color: "text-white/60", bg: "bg-white dark:bg-gray-900/10" };
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesPanel({ isHost, userName, meetingCode, sharedFiles = [], onSharedFilesChange }) {
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);

  // Receive remote file share events
  React.useEffect(() => {
    const handler = (f) => {
      if (onSharedFilesChange) {
        onSharedFilesChange((prev) => {
          if (prev.some((x) => x.id === f.id)) return prev;
          return [f, ...prev];
        });
      }
      toast.info(`📎 ${f.uploader} shared: ${f.name}`);
    };
    socket.on("meeting:file-shared", handler);
    return () => socket.off("meeting:file-shared", handler);
  }, [onSharedFilesChange]);

  const processFile = (file) => {
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) { toast.error(`File exceeds ${MAX_SIZE_MB} MB limit`); return; }

    const newFile = {
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: getExt(file.name),
      uploader: userName,
      uploadedAt: new Date().toISOString(),
      blobUrl: URL.createObjectURL(file),
    };

    if (onSharedFilesChange) {
      onSharedFilesChange((prev) => [newFile, ...prev]);
    }
    socket.emit("meeting:relay-event", {
      event: "meeting:file-shared",
      payload: { ...newFile, blobUrl: null }, // don't relay blob URL
    });
    toast.success(`📎 Shared: ${file.name}`);
  };

  const handleFiles = (fileList) => Array.from(fileList).forEach(processFile);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const deleteFile = (id) => {
    if (onSharedFilesChange) {
      onSharedFilesChange((prev) => prev.filter((f) => f.id !== id));
    }
    toast.success("File removed");
  };

  const downloadFile = (f) => {
    if (!f.blobUrl) { toast.error("File not available for download"); return; }
    const a = document.createElement("a");
    a.href = f.blobUrl;
    a.download = f.name;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-black dark:bg-black text-white dark:text-white ">
      {/* Drop zone */}
      <div
        className={`m-3 shrink-0 border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer
          ${dragging ? "border-[#2C2DE0] bg-[#2C2DE0]/10" : "border-white/20 hover:border-white/40 hover:bg-white dark:bg-gray-900/5"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={20} className={`mx-auto mb-1.5 ${dragging ? "text-[#2C2DE0]" : "text-white/40"}`} />
        <p className="text-xs text-white/60 font-semibold">
          {dragging ? "Drop to share!" : "Click or drag files to share"}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">PDF, DOCX, PPTX, Images, ZIP · Max {MAX_SIZE_MB}MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip,.rar"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {sharedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30">
            <span className="text-4xl">📁</span>
            <p className="text-xs">No files shared yet</p>
          </div>
        ) : (
          sharedFiles.map((f) => {
            const meta = getFileMeta(f.name);
            const Icon = meta.icon;
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/5 hover:bg-white dark:bg-gray-900/10 border border-white/10 rounded-xl transition-colors group"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={meta.color} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{f.name}</p>
                  <p className="text-white/40 text-[10px]">
                    {f.uploader} · {f.size ? formatBytes(f.size) : "shared"} ·{" "}
                    {new Date(f.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {f.blobUrl && (
                    <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                      onClick={() => setPreviewFile(f)}
                      title="Preview"
                      className="p-1.5 rounded-lg hover:bg-white dark:bg-gray-900/10 text-white/50 hover:text-white"
                    >
                      <Eye size={13} />
                    </button>
                  )}
                  {f.blobUrl && (
                    <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                      onClick={() => downloadFile(f)}
                      title="Download"
                      className="p-1.5 rounded-lg hover:bg-white dark:bg-gray-900/10 text-white/50 hover:text-white"
                    >
                      <Download size={13} />
                    </button>
                  )}
                  {(isHost || f.uploader === userName) && (
                    <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                      onClick={() => deleteFile(f.id)}
                      title="Remove"
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-white font-bold text-sm">{previewFile.name}</span>
              <button onClick={() => setPreviewFile(null)} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white dark:bg-gray-900/10">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {["jpg","jpeg","png","gif"].includes(getExt(previewFile.name)) ? (
                <img src={previewFile.blobUrl} alt={previewFile.name} className="max-w-full mx-auto rounded-xl" />
              ) : ["mp4","mov"].includes(getExt(previewFile.name)) ? (
                <video src={previewFile.blobUrl} controls className="w-full rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/40">
                  <span className="text-5xl">📄</span>
                  <p className="text-sm">Preview not available for this file type</p>
                  <button onClick={() => downloadFile(previewFile)} className="px-4 py-2 rounded-xl bg-[#2C2DE0] text-white text-sm font-bold">
                    Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
