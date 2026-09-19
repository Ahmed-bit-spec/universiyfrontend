import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Hash, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getTrendingTags, getTrendingPosts } from "@/api/Communityapi";
import PostCard from "./PostCard";
import { Spinner } from "./ui";

const TrendingPage = () => {
  const { t } = useLanguage();
  const [tags, setTags]       = useState([]);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrendingTags(), getTrendingPosts(15)])
      .then(([tagData, postData]) => {
        if (tagData?.tags) setTags(tagData.tags);
        if (postData?.posts) setPosts(postData.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <TrendingUp size={18} className="text-[#2C2DE0]" />
        <h1 className="text-lg font-black text-gray-900 dark:text-white">
          {t["trending.title"] ?? "Trending"}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={18} className="text-[#2C2DE0]" />
        </div>
      ) : (
        <>
          {tags.length > 0 && (
            <section className="mb-10">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Hash size={12} />
                {t["trending.topics"] ?? "Top topics"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((item, idx) => (
                  <Link
                    key={item.tag}
                    to={`/community?tag=${encodeURIComponent(item.tag)}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0] transition-colors"
                  >
                    <span className="text-[10px] font-black text-gray-400 w-4">{idx + 1}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">#{item.tag}</span>
                    <span className="text-xs text-gray-400">{item.posts} posts</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
              <Flame size={12} className="text-orange-500" />
              {t["trending.hotPosts"] ?? "Hot posts"}
            </h2>
            {posts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">
                {t["trending.noPosts"] ?? "No trending posts yet."}
              </p>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default TrendingPage;
