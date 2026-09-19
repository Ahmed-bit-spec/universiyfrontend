import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchBookmarks } from "@/api/Communityapi";
import PostCard from "./PostCard";
import { Spinner } from "./ui";

const BookmarksPage = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBookmarks();
      if (data.success) setPosts(data.posts ?? []);
      else setError(t["bookmarks.error"] ?? "Could not load bookmarks.");
    } catch {
      setError(t["bookmarks.error"] ?? "Could not load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onDeleted = (e) => {
      const { postId } = e.detail ?? {};
      if (postId) setPosts((prev) => prev.filter((p) => p._id !== postId));
    };
    window.addEventListener("community:post-deleted", onDeleted);
    return () => window.removeEventListener("community:post-deleted", onDeleted);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <Bookmark size={18} className="text-[#2C2DE0]" />
        <h1 className="text-lg font-black text-gray-900 dark:text-white">
          {t["sidebar.bookmarks"] ?? "Saved posts"}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-20 text-gray-400">
          <Spinner size={18} className="text-[#2C2DE0] mr-2" />
          <span className="text-sm">{t["feed.loading"] ?? "Loading…"}</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-sm text-red-500 py-16">{error}</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-24">
          <Bookmark size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm font-semibold text-gray-500">
            {t["bookmarks.empty"] ?? "No saved posts yet."}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t["bookmarks.emptyHint"] ?? "Bookmark posts from the feed to read them later."}
          </p>
        </div>
      )}

      {!loading && posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
          onBookmarkToggled={(id, bookmarked) => {
            if (!bookmarked) setPosts((prev) => prev.filter((p) => p._id !== id));
          }}
        />
      ))}
    </div>
  );
};

export default BookmarksPage;
