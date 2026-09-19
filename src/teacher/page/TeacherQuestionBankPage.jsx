import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen, Search, Filter, Plus, Edit, Trash, Copy, Star, Download,
  Upload, Loader2, X, Folder, Sparkles, ChevronLeft, ChevronRight, Layers
} from "lucide-react";

export default function TeacherQuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);

  // Filters
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [diffFilter, setDiffFilter]   = useState("");
  const [favOnly, setFavOnly]         = useState(false);

  // Form / Editor State
  const [editingQ, setEditingQ] = useState(null); // null = not editing/creating
  const [formType, setFormType] = useState("mcq");
  const [formData, setFormData] = useState({
    question: "", explanation: "", difficulty: "medium", topic: "", tags: "",
    marks: 1.0, answer: "", options: ["", "", "", ""], starterCode: "", testCases: []
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        page, limit: 10,
        search, type: typeFilter, difficulty: diffFilter,
        isFavorite: favOnly ? "true" : undefined
      };
      const { data } = await axios.get("/api/question-bank", { params });
      setQuestions(data.data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, search, typeFilter, diffFilter, favOnly]);

  // Lightweight stats derived from the current page — good enough for a
  // header glance without a separate aggregation endpoint.
  const stats = useMemo(() => {
    const favorites = questions.filter(q => q.isFavorite).length;
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
    return { favorites, byDifficulty };
  }, [questions]);

  const handleFavorite = async (id) => {
    try {
      await axios.post(`/api/question-bank/${id}/favorite`);
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to toggle favorite");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`/api/question-bank/${id}/duplicate`);
      toast.success("Question duplicated");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to duplicate");
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this question?")) return;
    try {
      await axios.delete(`/api/question-bank/${id}`);
      toast.success("Question archived");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to archive");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        type: formType,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        options: ["mcq", "multi_select"].includes(formType) ? formData.options.filter(Boolean) : undefined,
      };

      if (editingQ?._id) {
        await axios.put(`/api/question-bank/${editingQ._id}`, payload);
        toast.success("Question updated");
      } else {
        await axios.post("/api/question-bank", payload);
        toast.success("Question created");
      }
      setEditingQ(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save question");
    }
  };

  const startCreate = () => {
    setEditingQ({ isNew: true });
    setFormData({
      question: "", explanation: "", difficulty: "medium", topic: "", tags: "",
      marks: 1.0, answer: "", options: ["", "", "", ""], starterCode: "", testCases: []
    });
  };

  const startEdit = (q) => {
    setEditingQ(q);
    setFormType(q.type);
    setFormData({
      question: q.question,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      topic: q.topic || "",
      tags: q.tags?.join(", ") || "",
      marks: q.marks || 1.0,
      answer: q.answer || "",
      options: q.options || ["", "", "", ""],
      starterCode: q.starterCode || "",
    });
  };

  const handleExport = () => {
    window.open("/api/question-bank/export", "_blank");
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!parsed.questions?.length) throw new Error("Invalid format");
        await axios.post("/api/question-bank/bulk-import", { questions: parsed.questions });
        toast.success("Questions imported successfully!");
        fetchQuestions();
      } catch (err) {
        toast.error("Import failed. Make sure the file is a valid JSON Question Bank.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 w-full mx-auto p-4 md:p-6  dark:bg-zinc-950 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#2C2DE0]" />
            Question Bank
          </h1>
          <p className="text-gray-500 text-sm">
            Your persistent repository of assessment tasks and labs — build it up once, reuse it across every exam.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white font-bold text-sm rounded-xl shadow-md transition-colors text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            <Plus className="w-4 h-4" /> Create Question
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-[#2C2DE0]" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total (this page)</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
            <Star className="w-4.5 h-4.5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Favorites</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{stats.favorites}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Easy / Medium / Hard</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {stats.byDifficulty.easy || 0} · {stats.byDifficulty.medium || 0} · {stats.byDifficulty.hard || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Need more?</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Try AI Generate from an exam</p>
          </div>
        </div>
      </div>

      {/* Form Drawer (Create/Edit Modal) */}
      {editingQ && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2C2DE0]" />
                {editingQ.isNew ? "Create Question" : "Edit Question"}
              </h3>
              <button onClick={() => setEditingQ(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Question Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="truefalse">True / False</option>
                  <option value="essay">Essay / Free Text</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="programming">Programming Lab</option>
                  <option value="sql">SQL Lab</option>
                  <option value="html_css_js">Design (HTML/CSS/JS)</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Question Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the assessment details or prompt..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none resize-y"
                />
              </div>

              {/* Marks & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Marks / Points</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    required
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Topic & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Algorithms"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. array, loops"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Explanation (shown post-exam) */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Explanation / Answer Key</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Shown to students after exam results are published..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none resize-y"
                />
              </div>

              {/* Dynamic Type Fields */}
              {formType === "mcq" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Options & Correct Selection</label>
                  {formData.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctMCQ"
                        checked={formData.answer === opt && opt !== ""}
                        onChange={() => setFormData({ ...formData, answer: opt })}
                        className="text-[#2C2DE0] focus:ring-[#2C2DE0] h-4 w-4"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const list = [...formData.options];
                          list[oi] = e.target.value;
                          setFormData({ ...formData, options: list });
                        }}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {formType === "truefalse" && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Correct Answer</label>
                  <div className="flex gap-4">
                    {["true", "false"].map((val) => (
                      <label key={val} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="tfAnswer"
                          value={val}
                          checked={String(formData.answer) === val}
                          onChange={() => setFormData({ ...formData, answer: val })}
                          className="text-[#2C2DE0] focus:ring-[#2C2DE0]"
                        />
                        {val.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingQ(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white font-bold text-sm rounded-xl shadow-md text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search questions by text or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none text-gray-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-0 focus:outline-none font-semibold text-gray-700 dark:text-gray-300"
            >
              <option value="">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="truefalse">True/False</option>
              <option value="essay">Essay</option>
              <option value="short_answer">Short Answer</option>
              <option value="programming">Programming Lab</option>
              <option value="sql">SQL Lab</option>
              <option value="html_css_js">Design (HTML/CSS/JS)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 border-l border-gray-200 dark:border-zinc-800 pl-4">
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="bg-transparent border-0 focus:outline-none font-semibold text-gray-700 dark:text-gray-300"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold cursor-pointer border-l border-gray-200 dark:border-zinc-800 pl-4">
            <input
              type="checkbox"
              checked={favOnly}
              onChange={(e) => setFavOnly(e.target.checked)}
              className="rounded border-gray-300 text-[#2C2DE0] focus:ring-[#2C2DE0] h-3.5 w-3.5"
            />
            Favorites
          </label>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2C2DE0]" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-400">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">No questions found</p>
          <p className="text-xs text-gray-500 mt-1">Add items to the bank, or generate a batch with AI from an exam.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q._id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0]/30 transition-all flex flex-col md:flex-row gap-4 items-start justify-between">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-zinc-800 text-gray-500">
                    {q.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                    ${q.difficulty === "easy" ? "bg-[#2C2DE0] text-white dark:bg-[#2C2DE0]/10 dark:text-[#2C2DE0]" :
                      q.difficulty === "hard" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
                                                "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{q.marks} pt{q.marks !== 1 ? "s" : ""}</span>
                  {q.usageCount > 0 && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-1.5 py-0.5 rounded font-semibold">
                      Used in {q.usageCount} exam{q.usageCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {q.topic && (
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                      📁 {q.topic}
                    </span>
                  )}
                  {q.tags?.map((t, idx) => (
                    <span key={idx} className="text-[10px] text-gray-400 bg-gray-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {q.question}
                </p>
                {q.explanation && (
                  <p className="text-xs text-gray-400 italic">
                    Explanation: {q.explanation}
                  </p>
                )}
              </div>

              {/* Action column */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleFavorite(q._id)}
                  className={`p-2 border border-gray-100 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors
                    ${q.isFavorite ? "text-yellow-500 border-yellow-200 bg-yellow-50 dark:bg-yellow-500/10" : "text-gray-400"}`}
                >
                  <Star className={`w-4 h-4 ${q.isFavorite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => handleDuplicate(q._id)}
                  title="Duplicate"
                  className="p-2 border border-gray-100 dark:border-zinc-800 text-gray-400 rounded-lg hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEdit(q)}
                  title="Edit"
                  className="p-2 border border-gray-100 dark:border-zinc-800 text-gray-400 rounded-lg hover:text-[#2C2DE0] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(q._id)}
                  title="Archive / Delete"
                  className="p-2 border border-gray-100 dark:border-zinc-800 text-gray-400 rounded-lg hover:text-red-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-between pt-4 font-semibold text-xs text-gray-500">
              <span>Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 10 >= total}
                  className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}