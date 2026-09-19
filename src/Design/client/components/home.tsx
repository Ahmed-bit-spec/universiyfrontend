import { useState, useCallback } from "react";
import { Plus, Trash2, Edit3, Sparkles } from "lucide-react";
import type { Design, Template } from "../types";
import { api } from "../api";
import { TemplateCard } from "./template-card";

interface HomeProps {
  designs: Design[];
  templates: Template[];
  navigate: (to: string) => void;
  createDesign: () => Promise<string | undefined>;
  deleteDesign: (id: string) => Promise<void>;
  renameDesign: (id: string, name: string) => Promise<void>;
  createFromTemplate: (template: Template) => Promise<string | undefined>;
}

export function Home({
  designs,
  templates,
  navigate,
  createDesign,
  deleteDesign,
  renameDesign,
  createFromTemplate,
}: HomeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = useCallback(async () => {
    const id = await createDesign();
    if (id) navigate(`/design/${id}`);
  }, [createDesign, navigate]);

  const handleTemplateClick = useCallback(
    async (t: Template) => {
      const id = await createFromTemplate(t);
      if (id) navigate(`/design/${id}`);
    },
    [createFromTemplate, navigate]
  );

  const startRename = (id: string, name: string, e: Event) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="min-h-full bg-[#F3F4F7]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-800 m-0">My Designs</h1>
            <p className="text-xs text-zinc-400 mt-0.5 m-0">
              {designs.length} design{designs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
            onClick={handleCreate}
          >
            <Plus size={15} />
            New Design
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Templates section */}
        {templates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#6366f1]" />
              <h2 className="text-sm font-semibold text-zinc-700 m-0">Start from a template</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} onClick={() => handleTemplateClick(t)} />
              ))}
            </div>
          </div>
        )}

        {/* Designs grid */}
        {designs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No designs yet</p>
            <p className="text-xs text-zinc-400 mb-4">Create your first design to get started</p>
            <button
              className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
              onClick={handleCreate}
            >
              <Plus size={14} />
              Create Design
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-zinc-700 mb-3 m-0">Recent designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-zinc-200 overflow-hidden cursor-pointer transition-all hover:border-[#6366f1] hover:shadow-md group"
                  onClick={() => navigate(`/design/${d.id}`)}
                >
                  {/* Preview area */}
                  <div className="aspect-[4/3] bg-zinc-100 flex items-center justify-center">
                    {d.thumbnail_url ? (
                      <img
                        src={d.thumbnail_url}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-zinc-300 text-[10px] font-medium">
                        {d.width} x {d.height}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    {editingId === d.id ? (
                      <input
                        className="w-full bg-zinc-100 border border-[#6366f1] rounded text-zinc-800 text-xs px-2 py-1 outline-none"
                        value={editName}
                        onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") finishRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-700 truncate m-0">
                            {d.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 m-0">
                            {d.width} x {d.height} &middot;{" "}
                            {new Date(d.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
                            onClick={(e) => startRename(d.id, d.name, e as unknown as Event)}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            className="bg-white text-zinc-700 text-sm font-medium border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 group"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDesign(d.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}