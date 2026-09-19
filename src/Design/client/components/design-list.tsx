import { useState } from "react";
import { Trash2, Edit3, Plus } from "lucide-react";
import { useEditor } from "../context";

export function DesignList() {
  const { designs, activeDesign, createDesign, loadDesign, deleteDesign, renameDesign, navigate } =
    useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="bg-white text-zinc-700 text-sm font-semibold border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 flex items-center justify-center gap-1 px-3 py-2"
        onClick={createDesign}
      >
        <Plus size={14} />
        New Design
      </button>

      {designs.length === 0 && (
        <p className="text-zinc-400 text-[11px] text-center py-4">No saved designs yet</p>
      )}

      {designs.map((d) => (
        <div
          key={d.id}
          className={`flex items-center px-2.5 py-2 rounded-lg border transition-all group cursor-pointer ${activeDesign?.id === d.id
              ? "border-accent bg-accent/10"
              : "border-zinc-200 bg-white dark:bg-gray-900 hover:border-zinc-600"
            }`}
          onClick={() => {
            navigate(`/design/${d.id}`);
            loadDesign(d.id);
          }}
        >
          {editingId === d.id ? (
            <input
              className="flex-1 bg-zinc-100 border border-accent rounded text-zinc-700 text-xs px-1.5 py-0.5 outline-none"
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
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-zinc-600 truncate block">{d.name}</span>
              <span className="text-[10px] text-zinc-600">
                {d.width}x{d.height} &middot;{" "}
                {new Date(d.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button
              className="bg-white text-zinc-500 border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 p-2"
              onClick={(e) => {
                e.stopPropagation();
                startRename(d.id, d.name);
              }}
            >
              <Edit3 size={12} />
            </button>
            <button
              className="bg-white text-zinc-500 border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 transition-all duration-150 p-2"
              onClick={(e) => {
                e.stopPropagation();
                deleteDesign(d.id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
