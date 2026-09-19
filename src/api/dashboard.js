const API_BASE = import.meta.env?.VITE_API_BASE_URL || "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getDashboardStats = () => apiFetch("/dashboard/stats");
export const getRecommendedBooks = () => apiFetch("/dashboard/recommended-books");
export const getRecentActivity = () => apiFetch("/dashboard/recent-activity");
export const getRecentlyViewedBooks = () => apiFetch("/dashboard/recently-viewed");