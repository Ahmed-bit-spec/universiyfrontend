// Main community feed — Facebook-style with React Query infinite scroll
// CreatePostComposer removed from top of feed; posting happens via header pencil icon

import React, { useEffect, useRef, useCallback } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import PostCard from "@/community/PostCard";
import { Spinner, BTN_PRIMARY, BTN_SECONDARY } from "@/community/ui";
import { getFeed, searchPosts } from "@/api/Communityapi";

const FEED_KEY = ["community", "feed"];

const Feed = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const ctx = useOutletContext() ?? {};
  const { onOpenWrite, newPost } = ctx;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const tagFilter = searchParams.get("tag") || "";
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...FEED_KEY, searchQuery, tagFilter],
    queryFn: async ({ pageParam = 1 }) => {
      if (searchQuery) {
        const res = await searchPosts(searchQuery);
        return { posts: res.posts ?? [], page: 1, totalPages: 1 };
      }
      const res = await getFeed(pageParam, 10);
      let posts = res.posts ?? [];
      if (tagFilter) posts = posts.filter((p) => p.tags?.includes(tagFilter));
      return { posts, page: res.page ?? pageParam, totalPages: res.totalPages ?? 1 };
    },
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  // Prepend newly created post coming from the layout's WritePostModal
  useEffect(() => {
    if (!newPost?._id) return;
    queryClient.setQueryData([...FEED_KEY, searchQuery, tagFilter], (old) => {
      if (!old?.pages?.length) return old;
      const first = old.pages[0];
      if (first.posts.some((p) => p._id === newPost._id)) return old;
      return {
        ...old,
        pages: [{ ...first, posts: [newPost, ...first.posts] }, ...old.pages.slice(1)],
      };
    });
  }, [newPost, queryClient, searchQuery, tagFilter]);

  // Real-time socket events → update cache
  useEffect(() => {
    const updatePosts = (updater) => {
      queryClient.setQueriesData({ queryKey: FEED_KEY }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: updater(page.posts),
          })),
        };
      });
    };

    const onLike = (e) => {
      const { postId, likesCount, userId, liked } = e.detail ?? {};
      updatePosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const isMe = user && String(userId) === String(user._id);
          return {
            ...p,
            likesCount,
            likes: isMe && liked
              ? [...(p.likes ?? []), user._id]
              : isMe
              ? (p.likes ?? []).filter((id) => String(id) !== String(user._id) && String(id?._id) !== String(user._id))
              : p.likes,
          };
        })
      );
    };

    const onComment = (e) => {
      const { postId, commentsCount } = e.detail ?? {};
      updatePosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, commentsCount } : p))
      );
    };

    const onCreated = (e) => {
      const post = e.detail;
      if (!post?._id) return;
      queryClient.setQueriesData({ queryKey: FEED_KEY }, (old) => {
        if (!old?.pages?.length) return old;
        const first = old.pages[0];
        if (first.posts.some((p) => p._id === post._id)) return old;
        return {
          ...old,
          pages: [{ ...first, posts: [post, ...first.posts] }, ...old.pages.slice(1)],
        };
      });
    };

    const onDeleted = (e) => {
      const { postId } = e.detail ?? {};
      if (!postId) return;
      updatePosts((prev) => prev.filter((p) => p._id !== postId));
    };

    window.addEventListener("community:post-like", onLike);
    window.addEventListener("community:comment-new", onComment);
    window.addEventListener("community:comment-deleted", onComment);
    window.addEventListener("community:post-created", onCreated);
    window.addEventListener("community:post-deleted", onDeleted);
    return () => {
      window.removeEventListener("community:post-like", onLike);
      window.removeEventListener("community:comment-new", onComment);
      window.removeEventListener("community:comment-deleted", onComment);
      window.removeEventListener("community:post-created", onCreated);
      window.removeEventListener("community:post-deleted", onDeleted);
    };
  }, [user, queryClient]);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && !searchQuery) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, searchQuery]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, posts.length]);

  const handleLikeToggled = (postId, liked, likesCount) => {
    queryClient.setQueriesData({ queryKey: FEED_KEY }, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  likesCount,
                  likes: liked
                    ? [...(p.likes ?? []), user._id]
                    : (p.likes ?? []).filter((id) => id !== user._id && id?._id !== user._id),
                }
              : p
          ),
        })),
      };
    });
  };

  const handleDeleted = (postId) => {
    queryClient.setQueriesData({ queryKey: FEED_KEY }, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((p) => p._id !== postId),
        })),
      };
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-0">
      {/* Search/filter banner */}
      {(searchQuery || tagFilter) && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/15 border border-[#2C2DE0]/20 dark:border-[#2C2DE0]/30">
          <p className="text-[13px] text-[#1E1FAA] dark:text-[#8fe040] font-semibold">
            {searchQuery && (t["feed.searchResults"] ?? `Results for "${searchQuery}"`).replace("{query}", searchQuery)}
            {tagFilter && (t["feed.tagFilter"] ?? `Posts tagged #${tagFilter}`).replace("{tag}", tagFilter)}
          </p>
        </div>
      )}

      {/* Tab bar */}
      {!searchQuery && !tagFilter && (
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-gray-800 mb-2">
          <span className="px-4 py-2.5 text-[13px] font-bold border-b-2 border-[#2C2DE0] text-gray-900 dark:text-white">
            {t["feed.forYou"] ?? "For you"}
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Spinner size={18} className="mr-2 text-[#2C2DE0]" />
          <span className="text-[13px]">{t["feed.loading"] ?? "Loading posts…"}</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="text-center py-16">
          <p className="text-sm text-red-500 mb-3">
            {t["feed.errorLoad"] ?? "Couldn't load the feed."}
          </p>
          <button onClick={() => refetch()} className={BTN_SECONDARY}>
            {t["feed.tryAgain"] ?? "Try again"}
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="text-center py-24">
          <p className="text-[15px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
            {t["feed.empty"] ?? "No posts yet."}
          </p>
          <p className="text-[13px] text-gray-400 dark:text-gray-600 dark:text-gray-400 mb-5">
            {t["feed.emptyHint"] ?? "Be the first to share something with the community."}
          </p>
          <button onClick={onOpenWrite} className={BTN_PRIMARY}>
            {t["feed.writePost"] ?? "Write a post"}
          </button>
        </div>
      )}

      {/* Posts */}
      {!isLoading &&
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLikeToggled={handleLikeToggled}
            onDeleted={handleDeleted}
          />
        ))}

      {/* Infinite scroll sentinel */}
      {!isLoading && hasNextPage && !searchQuery && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-gray-400">
              <Spinner size={16} className="text-[#2C2DE0]" />
              <span className="text-[13px]">{t["feed.loading"] ?? "Loading posts…"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;