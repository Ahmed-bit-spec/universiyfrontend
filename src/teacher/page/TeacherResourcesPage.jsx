import React, { useState } from "react";
import { FolderOpen, UploadCloud, Search, FileText, Trash2, Download } from "lucide-react";
import { useTeacherLanguage } from "../hooks/useLanguages";

export default function TeacherResourcesPage() {
  const { t } = useTeacherLanguage();
  const p = t?.resources || {};
  const c = t?.common || {};

  const [search, setSearch] = useState("");

  const mockResources = [
    { id: 1, title: "Chapter 1: React Basics", category: "lectures", size: "2.4 MB", date: "2024-03-15" },
    { id: 2, title: "Midterm Preparation Guide", category: "references", size: "1.1 MB", date: "2024-03-10" },
    { id: 3, title: "Lab 1 Assignment", category: "assignments", size: "850 KB", date: "2024-03-05" },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="text-[#2C2DE0]" />
            {p.title || "Resources"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{p.subtitle || "Upload lecture notes, slides, PDFs, and other course materials."}</p>
        </div>
        <button className="bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
          <UploadCloud className="w-4 h-4" /> {p.uploadResource || "Upload Resource"}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={p.searchPlaceholder || "Search resources..."} 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2DE0] dark:text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium dark:text-white focus:outline-none">
            <option value="">{p.allCategories || "All Categories"}</option>
            <option value="lectures">{p.lectures || "Lectures"}</option>
            <option value="assignments">{p.assignments || "Assignments"}</option>
            <option value="references">{p.references || "References"}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="pb-3 pl-4">{p.fileName || "File Name"}</th>
                <th className="pb-3 px-4">{p.category || "Category"}</th>
                <th className="pb-3 px-4">{p.fileSize || "Size"}</th>
                <th className="pb-3 px-4">{p.uploadedAt || "Uploaded"}</th>
                <th className="pb-3 pr-4 text-right">{c.actions || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {mockResources.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="py-4 pl-4 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#2C2DE0] dark:text-[#2C2DE0]" />
                    </div>
                    {res.title}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                      {p[res.category] || res.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {res.size}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {res.date}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#2C2DE0] hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/10 rounded-md transition-colors text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group" title={p.download || "Download"}>
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title={p.deleteResource || "Delete"}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {mockResources.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                    {p.noResources || "No resources uploaded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
