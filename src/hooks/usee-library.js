// hooks/usee-library.js — Uniso E-Library
// All data persisted in MongoDB. No localStorage for user data.
// localStorage used ONLY for optimistic UI caching (invalidated on mount).

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

export const CATEGORY_ICONS = {

  all: "📚",

  fiction: "🎭",

  "non-fiction": "📰",

  science: "🔬",

  technology: "💻",

  history: "🏛️",

  biography: "👤",

  philosophy: "🧠",

  religion: "🕌",

  law: "⚖️",

  medicine: "🩺",

  economics: "📈",

  arts: "🎨",

  language: "🗣️",

  children: "🧒",

  poetry: "✍️",

  travel: "🌍",

  psychology: "🧪",

  education: "🎓",

  politics: "🏛️",

};



export const CATEGORY_KEYS = [

  { slug: "all", key: "category.all" },

  { slug: "fiction", key: "category.fiction" },

  { slug: "non-fiction", key: "category.nonFiction" },

  { slug: "science", key: "category.science" },

  { slug: "technology", key: "category.technology" },

  { slug: "history", key: "category.history" },

  { slug: "biography", key: "category.biography" },

  { slug: "philosophy", key: "category.philosophy" },

  { slug: "religion", key: "category.religion" },

  { slug: "law", key: "category.law" },

  { slug: "medicine", key: "category.medicine" },

  { slug: "economics", key: "category.economics" },

  { slug: "arts", key: "category.arts" },

  { slug: "language", key: "category.language" },

  { slug: "children", key: "category.children" },

  { slug: "poetry", key: "category.poetry" },

  { slug: "travel", key: "category.travel" },

  { slug: "psychology", key: "category.psychology" },

  { slug: "education", key: "category.education" },

  { slug: "politics", key: "category.politics" },

];
// ══════════════════════════════════════════════════════════════════════════════
//  useELibrary — main hook for LibraryHome
// ══════════════════════════════════════════════════════════════════════════════
export const useELibrary = () => {
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 380);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 on search/category change
  useEffect(() => { setPage(1); }, [debouncedSearch, activeCategory]);

  // ── Books list ───────────────────────────────────────────────────────────
  const { data: booksData, isLoading, isFetching, error } = useQuery({
    queryKey: ["books", debouncedSearch, activeCategory, page],
    queryFn: () =>
      api.get("/books", { params: { search: debouncedSearch, category: activeCategory, page, limit: 12 } })
        .then((r) => r.data),
    keepPreviousData: true,
    staleTime: 30_000,
  });

  // ── Personalized recommendations ─────────────────────────────────────────
  const { data: recData, isLoading: recLoading } = useQuery({
    queryKey: ["recommendations", "personalized"],
    queryFn: () => api.get("/e-library/recommendations").then((r) => r.data),
    staleTime: 120_000,
    retry: 1,
  });

  // ── Favorites ────────────────────────────────────────────────────────────
  const { data: favData } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.get("/e-library/favorites").then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  const favoriteMutation = useMutation({
    mutationFn: (bookId) => api.post(`/e-library/favorites/${bookId}`).then((r) => r.data),
    onMutate: async (bookId) => {
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const prev = qc.getQueryData(["favorites"]) ?? [];
      const isFav = prev.some((b) => b._id === bookId);
      qc.setQueryData(["favorites"], isFav ? prev.filter((b) => b._id !== bookId) : [...prev, { _id: bookId }]);
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(["favorites"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const savedBooks = (favData ?? []).map((b) => b._id);

  return {
    // Search & filter
    searchInput, setSearchInput,
    debouncedSearch,
    activeCategory,
    handleCategoryChange: (cat) => setActiveCategory(cat),
    page, setPage,

    // Data
    books: booksData?.data ?? [],
    pagination: booksData?.pagination ?? { total: 0, page: 1, totalPages: 1 },
    isLoading, isFetching, error,

    // Recommendations
    trending: recData?.trending ?? [],
    newArrivals: recData?.newArrivals ?? [],
    recLoading,
    recommended: recData?.data ?? [],      // flat, _reason-tagged array
    booksRead: recData?.booksRead ?? 0,  // controller returns this at top level

    // Favorites
    savedBooks,
    favorites: favData ?? [],
    toggleFavorite: (bookId) => favoriteMutation.mutate(bookId),
    toggleSave: (bookId) => favoriteMutation.mutate(bookId),
  };
};

// ══════════════════════════════════════════════════════════════════════════════
//  useBookReader — reading progress + bookmarks per book
// ══════════════════════════════════════════════════════════════════════════════
export const useBookReader = (bookId) => {
  const qc = useQueryClient();

  // ── Progress ─────────────────────────────────────────────────────────────
  const { data: progressData } = useQuery({
    queryKey: ["progress", bookId],
    queryFn: () => bookId ? api.get(`/books/${bookId}/progress`).then((r) => r.data.data) : null,
    enabled: !!bookId,
    staleTime: 10_000,
  });

  const saveProgressMutation = useMutation({
    mutationFn: (body) => api.put(`/books/${bookId}/progress`, body).then((r) => r.data.data),
    onSuccess: (data) => qc.setQueryData(["progress", bookId], data),
  });

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const { data: bmData } = useQuery({
    queryKey: ["bookmarks", bookId],
    queryFn: () => bookId ? api.get(`/books/${bookId}/bookmarks`).then((r) => r.data.data ?? []) : [],
    enabled: !!bookId,
    staleTime: 30_000,
  });

  const addBmMutation = useMutation({
    mutationFn: (body) => api.post(`/books/${bookId}/bookmarks`, body).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks", bookId] }),
  });

  const removeBmMutation = useMutation({
    mutationFn: (bmId) => api.delete(`/books/${bookId}/bookmarks/${bmId}`),
    onMutate: async (bmId) => {
      await qc.cancelQueries({ queryKey: ["bookmarks", bookId] });
      const prev = qc.getQueryData(["bookmarks", bookId]) ?? [];
      qc.setQueryData(["bookmarks", bookId], prev.filter((b) => b._id !== bmId));
      return { prev };
    },
    onError: (_e, _id, ctx) => qc.setQueryData(["bookmarks", bookId], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["bookmarks", bookId] }),
  });

  return {
    savedProgress: progressData,
    saveProgress: (body) => saveProgressMutation.mutate(body),

    bookmarks: bmData ?? [],
    addBookmark: (body) => addBmMutation.mutate(body),
    removeBookmark: (bmId) => removeBmMutation.mutate(bmId),
  };
};

// ══════════════════════════════════════════════════════════════════════════════
//  useNotes — per-book, MongoDB-backed
// ══════════════════════════════════════════════════════════════════════════════
export const useNotes = (bookId) => {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notes", bookId],
    queryFn: () => bookId ? api.get(`/books/${bookId}/notes`).then((r) => r.data.data ?? {}) : {},
    enabled: !!bookId,
    staleTime: 30_000,
  });

  const mutateFn = useMutation({
    mutationFn: ({ page, text }) => api.put(`/books/${bookId}/notes/${page}`, { text }).then((r) => r.data),
    onMutate: async ({ page, text }) => {
      await qc.cancelQueries({ queryKey: ["notes", bookId] });
      const prev = qc.getQueryData(["notes", bookId]) ?? {};
      const next = { ...prev };
      if (text?.trim()) next[page] = text.trim();
      else delete next[page];
      qc.setQueryData(["notes", bookId], next);
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(["notes", bookId], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes", bookId] }),
  });

  return {
    notes: data ?? {},
    saveNote: (page, text) => mutateFn.mutate({ page, text }),
    deleteNote: (page) => mutateFn.mutate({ page, text: "" }),
  };
};

// ══════════════════════════════════════════════════════════════════════════════
//  useMyLibrary — My Library page: all user data in one place
// ══════════════════════════════════════════════════════════════════════════════
export const useMyLibrary = () => {
  const { data: favData, isLoading: fl } = useQuery({ queryKey: ["favorites"], queryFn: () => api.get("/books/favorites/mine").then((r) => r.data.data ?? []), staleTime: 60_000 });
  const { data: progressData, isLoading: pl } = useQuery({ queryKey: ["progress/all"], queryFn: () => api.get("/books/progress/all").then((r) => r.data.data ?? []), staleTime: 30_000 });
  const { data: bmData, isLoading: bl } = useQuery({ queryKey: ["bookmarks/all"], queryFn: () => api.get("/books/bookmarks/all").then((r) => r.data.data ?? []), staleTime: 30_000 });

  const allProgress = progressData ?? [];

  return {
    favorites: favData ?? [],
    continueReading: allProgress.filter((p) => p.percent > 0 && p.percent < 100),
    recentlyRead: allProgress.slice(0, 20),
    bookmarks: bmData ?? [],
    isLoading: fl || pl || bl,
    error: null,
  };
}; 