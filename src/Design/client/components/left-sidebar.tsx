import { useState, useRef, useCallback } from "react";
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Image,
  Upload,
  Palette,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { useEditor } from "../context";
import { TemplateCard } from "./template-card";
import { DesignList } from "./design-list";

type Section = "templates" | "text" | "shapes" | "images" | "background" | "designs";

const SECTIONS: { key: Section; icon: typeof LayoutGrid; label: string }[] = [
  { key: "templates", icon: Sparkles, label: "Templates" },
  { key: "shapes", icon: Square, label: "Elements" },
  { key: "text", icon: Type, label: "Text" },
  { key: "images", icon: Upload, label: "Resources" },
  { key: "background", icon: Palette, label: "Bg" },
];

const SECTION_TITLES: Record<Section, string> = {
  templates: "Templates",
  shapes: "Elements",
  text: "Text",
  images: "Lab Resources",
  background: "Background",
  designs: "Designs",
};

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const BG_COLORS = [
  "#1a1a2e", "#0f172a", "#18181b", "#1e1b4b",
  "#ffffff", "#f8fafc", "#fafaf9", "#fef3c7",
  "#2563eb", "#7c3aed", "#dc2626", "#059669",
  "#0891b2", "#d97706", "#e11d48", "#4f46e5",
];

const CONTROL_BTN = "bg-white text-zinc-700 border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all duration-150 group";

export function LeftSidebar() {
  const { addText, addShape, addImage, setBackground, teacherTemplates = [], teacherResources = [], teacherColors = [] } = useEditor();
  const [activeSection, setActiveSection] = useState<Section | null>("templates");

  const handleSectionClick = (key: Section) => {
    setActiveSection((prev) => (prev === key ? null : key));
  };

  // Image upload has been disabled for students due to security reasons.
  // Students can only use resources provided by the teacher for this specific lab exam.
  const handleImageUpload = useCallback(
    async (url: string) => {
      addImage(url);
    },
    [addImage]
  );

  // Background image upload disabled for students for exam security.
  // Students must use colors or gradients.

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      // Drop disabled for manual file uploads.
    },
    []
  );

  const isOpen = activeSection !== null;

  return (
    <aside className="flex flex-row shrink-0">
      {/* Icon Rail */}
      <div className="w-[70px] bg-white dark:bg-gray-900 border-r border-zinc-200 flex flex-col items-center pt-2 gap-0.5 shrink-0">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`${CONTROL_BTN} text-sm font-bold py-2 px-2 rounded-md flex flex-col items-center gap-1`}
            onClick={() => handleSectionClick(s.key)}
          >
            <s.icon size={20} />
            <span className="text-[10px] leading-tight">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div
        className="bg-white dark:bg-gray-900 border-r border-zinc-200 overflow-hidden transition-all duration-200 ease-in-out"
        style={{ width: isOpen ? "240px" : "0px" }}
      >
        <div className="w-[240px] h-full flex flex-col">
          {activeSection && (
            <>
              <div className="px-3 pt-3 pb-2 shrink-0">
                <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-wide m-0">
                  {SECTION_TITLES[activeSection]}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                {activeSection === "templates" && (
                  <div>
                    {teacherTemplates.length > 0 ? (
                      <>
                        <p className="text-zinc-400 text-[11px] mb-3">Teacher Templates (Sets background)</p>
                        <div className="grid grid-cols-2 gap-2">
                          {teacherTemplates.map((url, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-zinc-200 overflow-hidden cursor-pointer hover:border-accent transition-all group relative aspect-square bg-zinc-50"
                              onClick={() => setBackground("image", url)}
                            >
                              <img src={url} alt={`Template ${i + 1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-[10px] font-medium px-2 text-center">Set Layout</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center mt-2">
                        <Sparkles size={24} className="text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">
                          Templates added by your teacher will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "text" && (
                  <div className="flex flex-col gap-2">
                    <p className="text-zinc-400 text-[11px] mb-1">Click to add text</p>
                    <button
                      className={`${CONTROL_BTN} rounded-lg p-3 text-left`}
                      onClick={() => addText("heading")}
                    >
                      <span className="text-lg font-bold text-zinc-900 group-hover:text-accent transition-colors">
                        Add a heading
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Montserrat Bold, 48px
                      </span>
                    </button>
                    <button
                      className={`${CONTROL_BTN} rounded-lg p-3 text-left`}
                      onClick={() => addText("subheading")}
                    >
                      <span className="text-sm font-medium text-zinc-900 group-hover:text-accent transition-colors">
                        Add a subheading
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Inter Medium, 32px
                      </span>
                    </button>
                    <button
                      className={`${CONTROL_BTN} rounded-lg p-3 text-left`}
                      onClick={() => addText("body")}
                    >
                      <span className="text-xs text-zinc-900 group-hover:text-accent transition-colors">
                        Add body text
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Inter Regular, 18px
                      </span>
                    </button>
                  </div>
                )}

                {activeSection === "shapes" && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-2">Click to add a shape</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: "rect" as const, icon: Square, label: "Rectangle" },
                        { type: "circle" as const, icon: Circle, label: "Circle" },
                        { type: "triangle" as const, icon: Triangle, label: "Triangle" },
                        { type: "line" as const, icon: Minus, label: "Line" },
                      ].map((s) => (
                        <button
                          key={s.type}
                          className={`${CONTROL_BTN} rounded-lg p-4 flex flex-col items-center justify-center gap-1`}
                          onClick={() => addShape(s.type)}
                        >
                          <s.icon size={24} className="text-zinc-400" />
                          <span className="text-[11px] text-zinc-400">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "images" && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-2">Teacher Resources</p>
                    {teacherResources.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {teacherResources.map((url, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-zinc-200 overflow-hidden cursor-pointer hover:border-accent transition-all"
                            onClick={() => addImage(url)}
                          >
                            <img src={url} alt={`Resource ${i + 1}`} className="w-full h-auto object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
                        <Image size={24} className="text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">
                          Images added by your teacher will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "background" && (
                  <div>
                    {teacherColors.length > 0 && (
                      <>
                        <p className="text-zinc-400 text-[11px] mb-2">Teacher Colors</p>
                        <div className="grid grid-cols-4 gap-1.5 mb-4">
                          {teacherColors.map((c, i) => (
                            <button
                              key={`tc-${i}`}
                              className="w-full h-10 rounded-md border border-zinc-200 shadow-sm hover:border-zinc-400 transition-all duration-150"
                              style={{ background: c }}
                              onClick={() => setBackground("color", c)}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <p className="text-zinc-400 text-[11px] mb-2">Solid colors</p>
                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                      {BG_COLORS.map((c) => (
                        <button
                          key={c}
                          className="w-full h-10 rounded-md border border-zinc-200 shadow-sm hover:border-zinc-400 transition-all duration-150"
                          style={{ background: c }}
                          onClick={() => setBackground("color", c)}
                        />
                      ))}
                    </div>

                    <p className="text-zinc-400 text-[11px] mb-2">Custom color</p>
                    <input
                      type="color"
                      className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer bg-transparent"
                      onChange={(e) =>
                        setBackground("color", (e.target as HTMLInputElement).value)
                      }
                    />

                    <p className="text-zinc-400 text-[11px] mb-2 mt-4">Gradient presets</p>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {GRADIENT_PRESETS.map((g, i) => (
                        <button
                          key={i}
                          className="w-full h-10 rounded-md border border-zinc-200 shadow-sm hover:border-zinc-400 transition-all duration-150"
                          style={{ background: g }}
                          onClick={() => {
                            const match = g.match(/#[0-9a-f]{6}/gi);
                            if (match) setBackground("color", match[0]);
                          }}
                        />
                      ))}
                    </div>


                  </div>
                )}

                {activeSection === "designs" && <DesignList />}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
