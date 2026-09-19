import { useState, useRef, useEffect } from "react";
import * as fabric from "fabric";
import { MoreHorizontal, Copy, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { useEditor } from "../context";
import type { Page } from "../types";

function PageThumb({ page, width, height }: { page: Page; width: number; height: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const prevJsonRef = useRef<string>("");

  useEffect(() => {
    if (page.canvas_json === prevJsonRef.current) return;
    prevJsonRef.current = page.canvas_json;

    const el = document.createElement("canvas");
    const sc = new fabric.StaticCanvas(el, { width, height });
    try {
      const parsed = JSON.parse(page.canvas_json);
      sc.loadFromJSON(parsed).then(() => {
        sc.renderAll();
        const multiplier = Math.min(200 / width, 200 / height, 1);
        setSrc(sc.toDataURL({ format: "png", multiplier }));
        sc.dispose();
      });
    } catch {
      sc.dispose();
    }
  }, [page.canvas_json, width, height]);

  return src ? (
    <img src={src} className="rounded w-full h-full object-cover" alt={page.title} />
  ) : (
    <div className="rounded w-full h-full bg-zinc-100" />
  );
}

export function PagesBar() {
  const {
    pages, activePageId, addPage, duplicatePage, deletePage, renamePage,
    switchToPage, setActiveCanvas, canvasWidth, canvasHeight,
  } = useEditor();
  const [expanded, setExpanded] = useState(false);
  const [menuPageId, setMenuPageId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const ACTION_BTN = "inline-flex items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150 p-2";

  // Close menu on outside click
  useEffect(() => {
    if (!menuPageId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPageId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuPageId]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const startRename = (pageId: string, currentTitle: string) => {
    setMenuPageId(null);
    setRenamingId(pageId);
    setRenameValue(currentTitle);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      renamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handlePageClick = (pageId: string) => {
    setActiveCanvas(pageId);
    switchToPage(pageId);
    const pageEl = document.querySelector(`[data-page-id="${pageId}"]`);
    if (pageEl) pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (pages.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-zinc-200 shrink-0">
      {/* Collapsed bar — always visible */}
      <button
        className={ACTION_BTN}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] text-zinc-400 font-medium">
          Pages ({pages.length})
        </span>
        {expanded ? (
          <ChevronDown size={14} className="text-zinc-400" />
        ) : (
          <ChevronUp size={14} className="text-zinc-400" />
        )}
      </button>

      {/* Expanded thumbnail strip */}
      {expanded && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-zinc-100 overflow-x-auto">
          {pages.map((page) => {
            const isActive = page.id === activePageId;
            return (
              <div key={page.id} className="relative flex-shrink-0 group">
                <div
                  className={`relative flex flex-col items-center gap-1 cursor-pointer border-2 rounded-lg p-1 transition-all bg-white dark:bg-gray-900 ${isActive
                      ? "border-[#6366f1] shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  onClick={() => handlePageClick(page.id)}
                  style={{ width: 88 }}
                >
                  <div className="rounded w-full overflow-hidden" style={{ height: 50 }}>
                    <PageThumb page={page} width={canvasWidth} height={canvasHeight} />
                  </div>
                  <button
                    className={ACTION_BTN}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuPageId(menuPageId === page.id ? null : page.id);
                    }}
                  >
                    <MoreHorizontal size={12} className="text-zinc-400" />
                  </button>
                </div>
                <div className="mt-0.5 text-center" style={{ width: 88 }}>
                  {renamingId === page.id ? (
                    <input
                      ref={renameRef}
                      className="w-full text-center text-[10px] text-zinc-700 bg-zinc-100 border border-[#6366f1] rounded px-1 py-0 outline-none"
                      value={renameValue}
                      onInput={(e) => setRenameValue((e.target as HTMLInputElement).value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                  ) : (
                    <span
                      className={`text-[10px] truncate block ${isActive ? "text-zinc-800 font-medium" : "text-zinc-500"
                        }`}
                    >
                      {page.title}
                    </span>
                  )}
                </div>

                {menuPageId === page.id && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-900 border border-zinc-200 rounded-lg shadow-lg z-30 min-w-[130px] py-1"
                  >
                    <button
                      className={ACTION_BTN}
                      onClick={() => startRename(page.id, page.title)}
                    >
                      <Pencil size={12} />
                      Rename
                    </button>
                    <button
                      className={ACTION_BTN}
                      onClick={() => {
                        setMenuPageId(null);
                        duplicatePage(page.id);
                      }}
                    >
                      <Copy size={12} />
                      Duplicate
                    </button>
                    {pages.length > 1 && (
                      <button
                        className={ACTION_BTN}
                        onClick={() => {
                          setMenuPageId(null);
                          deletePage(page.id);
                        }}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}