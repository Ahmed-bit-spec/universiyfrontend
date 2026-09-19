import React, { useState } from "react";
import {
  Folder,
  File,
  HardDrive,
  Trash2,
  Plus,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const INITIAL_FS = {
  "This PC": {
    type: "folder",
    children: {
      "Local Disk (C:)": {
        type: "folder",
        children: {
          Users: {
            type: "folder",
            children: {
              Student: {
                type: "folder",
                children: {
                  Documents: { type: "folder", children: { "notes.txt": { type: "file", content: "Welcome to Windows Lab" } } },
                  Desktop: { type: "folder", children: {} },
                },
              },
            },
          },
        },
      },
    },
  },
  "Recycle Bin": { type: "folder", children: {} },
};

function getNode(fs, pathParts) {
  let node = fs;
  for (const part of pathParts) {
    if (!node[part]) return null;
    node = node[part];
    if (node.type === "folder") node = node.children;
  }
  return node;
}

export default function WindowsLab({ question, value, onChange }) {
  const [fs, setFs] = useState(value?.fs || INITIAL_FS);
  const [path, setPath] = useState(["This PC"]);
  const [selected, setSelected] = useState(null);
  const { t } = useLanguage();

  const currentFolder = getNode(fs, path) || {};
  const entries = Object.entries(typeof currentFolder === "object" ? currentFolder : {});

  const persist = nextFs => {
    setFs(nextFs);
    onChange?.({ fs: nextFs, path });
  };

  const navigate = name => {
    const entry = currentFolder[name];
    if (entry?.type === "folder") {
      setPath([...path, name]);
      setSelected(null);
    } else {
      setSelected(name);
    }
  };

  const createFolder = () => {
    const name = `New Folder ${Date.now().toString().slice(-4)}`;
    const next = structuredClone(fs);
    let folder = getNode(next, path);
    folder[name] = { type: "folder", children: {} };
    persist(next);
  };

  const createFile = () => {
    const name = `document_${Date.now().toString().slice(-4)}.txt`;
    const next = structuredClone(fs);
    let folder = getNode(next, path);
    folder[name] = { type: "file", content: "" };
    persist(next);
  };

  const deleteSelected = () => {
    if (!selected) return;
    const next = structuredClone(fs);
    let folder = getNode(next, path);
    delete folder[selected];
    persist(next);
    setSelected(null);
  };

  return (
    <div className="-mx-6 -my-6 h-[560px] flex flex-col bg-[#0c1929] text-neutral-200 overflow-hidden">
      <div className="h-9 bg-[#1a2b42] flex items-center px-4 border-b border-white/10 gap-2">
        <Monitor className="w-4 h-4 text-[#2C2DE0]" />
        <span className="text-xs font-medium">{t("exam.windowsLab") || "Windows Lab Simulation"}</span>
        <span className="text-[10px] text-neutral-500 ml-auto">{t("exam.windowsDemoMode") || "Demo mode — no login required"}</span>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-44 bg-[#0f1f33] border-r border-white/10 p-2 text-xs">
          <p className="text-neutral-500 uppercase tracking-wider text-[10px] px-2 mb-2">{t("exam.quickAccess") || "Quick access"}</p>
          {["This PC", "Recycle Bin"].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => { setPath([item]); setSelected(null); }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 ${
                path[0] === item ? "bg-[#2C2DE0]/30 text-[#2C2DE0]" : ""
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              {item === "This PC" ? (t("exam.thisPC") || "This PC") : (t("exam.recycleBin") || "Recycle Bin")}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 border-b border-white/10 flex items-center px-3 gap-1 text-xs overflow-x-auto">
            {path.map((seg, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />}
                <button
                  type="button"
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className="hover:text-[#2C2DE0] whitespace-nowrap"
                >
                  {seg === "This PC" ? (t("exam.thisPC") || "This PC") : seg === "Recycle Bin" ? (t("exam.recycleBin") || "Recycle Bin") : seg}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="h-9 border-b border-white/10 flex items-center gap-2 px-3">
            <button type="button" onClick={createFolder} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-[#2C2DE0]/30 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
              <Plus className="w-3 h-3" /> {t("exam.folder") || "Folder"}
            </button>
            <button type="button" onClick={createFile} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-[#2C2DE0]/30 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
              <Plus className="w-3 h-3" /> {t("exam.file") || "File"}
            </button>
            <button type="button" onClick={deleteSelected} disabled={!selected} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-red-950/30 disabled:opacity-40 ml-auto">
              <Trash2 className="w-3 h-3" /> {t("exam.delete") || "Delete"}
            </button>
          </div>

          <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-6 gap-4 content-start overflow-y-auto">
            {entries.map(([name, entry]) => (
              <button
                key={name}
                type="button"
                onClick={() => navigate(name)}
                onDoubleClick={() => entry.type === "folder" && navigate(name)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 ${
                  selected === name ? "bg-[#2C2DE0]/30 ring-1 ring-[#2C2DE0]" : ""
                }`}
              >
                {entry.type === "folder" ? (
                  <Folder className="w-10 h-10 text-[#2C2DE0]" />
                ) : (
                  <File className="w-10 h-10 text-neutral-400" />
                )}
                <span className="text-[10px] text-center truncate w-full">{name}</span>
              </button>
            ))}
            {entries.length === 0 && (
              <p className="col-span-full text-neutral-500 text-sm">{t("exam.emptyFolder") || "This folder is empty."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="h-8 bg-[#1a2b42] border-t border-white/10 flex items-center px-3 gap-2 text-[10px] text-neutral-500">
        <span className="w-2 h-2 rounded-full bg-[#2C2DE0]" />
        {question?.question || t("exam.windowsDefaultInstruction") || "File system interaction recorded for grading"}
      </div>
    </div>
  );
}
