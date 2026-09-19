import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Copy,
} from "lucide-react";
import * as fabric from "fabric";
import { useEditor } from "../context";

const FONT_FAMILIES = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lora",
  "Raleway",
  "Source Sans Pro",
  "Merriweather",
];

export function RightSidebar() {
  const { selectedObject, revision, updateSelectedObject, deleteSelected, canvas, setBackground, canvasWidth, canvasHeight, teacherColors = [] } =
    useEditor();

  const isText = selectedObject instanceof fabric.Textbox || selectedObject instanceof fabric.IText;
  const isImage = selectedObject instanceof fabric.FabricImage;
  const isShape = selectedObject && !isText && !isImage;

  if (!selectedObject) {
    return (
      <aside className="w-[280px] bg-white dark:bg-gray-900 border-l border-zinc-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Canvas</h2>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Dimensions</span>
            <span className="text-[11px] text-zinc-600 font-mono">{canvasWidth} x {canvasHeight}</span>
          </div>
          <label className="text-[11px] text-zinc-400">Background color</label>
          <input
            type="color"
            className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer bg-transparent"
            onChange={(e) => setBackground("color", (e.target as HTMLInputElement).value)}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-white dark:bg-gray-900 border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {isText ? "Text" : isImage ? "Image" : "Shape"}
        </h2>
        <div className="flex gap-1">
          <button
            className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
            onClick={async () => {
              if (!canvas || !selectedObject) return;
              const clone = await selectedObject.clone();
              clone.set({ left: (selectedObject.left || 0) + 20, top: (selectedObject.top || 0) + 20 });
              canvas.add(clone);
              canvas.setActiveObject(clone);
            }}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
            onClick={deleteSelected}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* ── Text properties ───────────────────────────────────────── */}
        {isText && (
          <>
            {/* Font family */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Font family</label>
              <select
                className="w-full bg-white dark:bg-gray-900 border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none cursor-pointer focus:border-accent"
                value={(selectedObject as any).fontFamily || "Inter"}
                onChange={(e) =>
                  updateSelectedObject({ fontFamily: (e.target as HTMLSelectElement).value })
                }
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Font size</label>
              <input
                type="number"
                className="w-full bg-white dark:bg-gray-900 border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-accent"
                value={(selectedObject as any).fontSize || 18}
                onInput={(e) =>
                  updateSelectedObject({
                    fontSize: parseInt((e.target as HTMLInputElement).value) || 18,
                  })
                }
              />
            </div>

            {/* Bold / Italic / Underline */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Style</label>
              <div className="flex gap-1">
                <button
                  className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                  onClick={() =>
                    updateSelectedObject({
                      fontWeight:
                        (selectedObject as any).fontWeight === "700" || (selectedObject as any).fontWeight === "bold"
                          ? "400"
                          : "700",
                    })
                  }
                >
                  <Bold size={14} />
                </button>
                <button
                  className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                  onClick={() =>
                    updateSelectedObject({
                      fontStyle: (selectedObject as any).fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                >
                  <Italic size={14} />
                </button>
                <button
                  className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                  onClick={() =>
                    updateSelectedObject({ underline: !(selectedObject as any).underline })
                  }
                >
                  <Underline size={14} />
                </button>
              </div>
            </div>

            {/* Text alignment */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Alignment</label>
              <div className="flex gap-1">
                {[
                  { align: "left", icon: AlignLeft },
                  { align: "center", icon: AlignCenter },
                  { align: "right", icon: AlignRight },
                ].map(({ align, icon: Icon }) => (
                  <button
                    key={align}
                    className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                    onClick={() => updateSelectedObject({ textAlign: align })}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Text color */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Color</label>
              {teacherColors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {teacherColors.map((c, i) => (
                    <button
                      key={`text-color-${i}`}
                      className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
                      style={{ background: c }}
                      onClick={() => updateSelectedObject({ fill: c })}
                      title={c}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={((selectedObject as any).fill as string) || "#ffffff"}
                  onInput={(e) =>
                    updateSelectedObject({ fill: (e.target as HTMLInputElement).value })
                  }
                />
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-gray-900 border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-accent font-mono"
                  value={((selectedObject as any).fill as string) || "#ffffff"}
                  onInput={(e) =>
                    updateSelectedObject({ fill: (e.target as HTMLInputElement).value })
                  }
                />
              </div>
            </div>

            {/* Line height */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 flex justify-between">
                Line height
                <span className="text-zinc-400 font-mono">{((selectedObject as any).lineHeight || 1.2).toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                className="w-full accent-accent"
                value={(selectedObject as any).lineHeight || 1.2}
                onInput={(e) =>
                  updateSelectedObject({
                    lineHeight: parseFloat((e.target as HTMLInputElement).value),
                  })
                }
              />
            </div>

            {/* Letter spacing */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 flex justify-between">
                Letter spacing
                <span className="text-zinc-400 font-mono">{(selectedObject as any).charSpacing || 0}</span>
              </label>
              <input
                type="range"
                min="-200"
                max="800"
                step="10"
                className="w-full accent-accent"
                value={(selectedObject as any).charSpacing || 0}
                onInput={(e) =>
                  updateSelectedObject({
                    charSpacing: parseInt((e.target as HTMLInputElement).value),
                  })
                }
              />
            </div>
          </>
        )}

        {/* ── Shape properties ──────────────────────────────────────── */}
        {isShape && (
          <>
            {/* Fill color */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Fill color</label>
              {teacherColors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {teacherColors.map((c, i) => (
                    <button
                      key={`fill-color-${i}`}
                      className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
                      style={{ background: c }}
                      onClick={() => updateSelectedObject({ fill: c })}
                      title={c}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={(selectedObject.fill as string) || "#6366f1"}
                  onInput={(e) =>
                    updateSelectedObject({ fill: (e.target as HTMLInputElement).value })
                  }
                />
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-gray-900 border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-accent font-mono"
                  value={(selectedObject.fill as string) || "#6366f1"}
                  onInput={(e) =>
                    updateSelectedObject({ fill: (e.target as HTMLInputElement).value })
                  }
                />
              </div>
            </div>

            {/* Stroke */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Stroke color</label>
              {teacherColors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {teacherColors.map((c, i) => (
                    <button
                      key={`stroke-color-${i}`}
                      className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
                      style={{ background: c }}
                      onClick={() => updateSelectedObject({ stroke: c })}
                      title={c}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={(selectedObject.stroke as string) || "#000000"}
                  onInput={(e) =>
                    updateSelectedObject({ stroke: (e.target as HTMLInputElement).value })
                  }
                />
                <input
                  type="number"
                  className="w-16 bg-white dark:bg-gray-900 border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-accent"
                  value={selectedObject.strokeWidth || 0}
                  min={0}
                  placeholder="Width"
                  onInput={(e) =>
                    updateSelectedObject({
                      strokeWidth: parseInt((e.target as HTMLInputElement).value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Border radius (for rect) */}
            {selectedObject instanceof fabric.Rect && (
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 flex justify-between">
                  Border radius
                  <span className="text-zinc-400 font-mono">{(selectedObject as any).rx || 0}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent"
                  value={(selectedObject as any).rx || 0}
                  onInput={(e) => {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    updateSelectedObject({ rx: val, ry: val });
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* ── Image properties ──────────────────────────────────────── */}
        {isImage && (
          <>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Flip</label>
              <div className="flex gap-1">
                <button
                  className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                  onClick={() => updateSelectedObject({ flipX: !selectedObject.flipX })}
                >
                  <FlipHorizontal size={14} />
                </button>
                <button
                  className={`bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group`}
                  onClick={() => updateSelectedObject({ flipY: !selectedObject.flipY })}
                >
                  <FlipVertical size={14} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Common: Opacity ───────────────────────────────────────── */}
        <div>
          <label className="text-[11px] text-zinc-400 mb-1 flex justify-between">
            Opacity
            <span className="text-zinc-400 font-mono">{Math.round((selectedObject.opacity ?? 1) * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            className="w-full accent-accent"
            value={selectedObject.opacity ?? 1}
            onInput={(e) =>
              updateSelectedObject({
                opacity: parseFloat((e.target as HTMLInputElement).value),
              })
            }
          />
        </div>
      </div>
    </aside>
  );
}