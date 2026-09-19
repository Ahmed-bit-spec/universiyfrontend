// PostCard — Facebook-style feed card with like, comment, share, delete
//
// CHANGES in this pass (see prompt "Community Feed Enhancement"):
//   FEATURE 3 — Translate button under the post text (Somali ⇄ English),
//     cached per post, toggles back to the original with no re-request.
//   FEATURE 4 — Like state hardened to depend ONLY on the current user.
//     `liked` is derived exclusively from post.likes matching user._id;
//     nothing here ever trusts a shared/global "liked" boolean from the
//     server. See translation note in PostDetail.jsx / backend section for
//     the corresponding API contract.
//   FEATURE 5/6 — MediaGrid replaced by <MediaGallery>, which renders the
//     Facebook/LinkedIn-style responsive grid (1/2/3/4/5+ layouts) and owns
//     its own fullscreen MediaViewer lightbox. Clicking media no longer
//     navigates away from the feed.
//   STYLE PASS — action buttons (like, comment, share, bookmark, translate,
//     menu items) simplified to plain icon-only buttons: no background
//     color, no drop-shadow, no visible text label. Icons only, with a
//     light hover state, matching a normal feed UI.
//
// Untouched from before: rich text rendering, header menu, comments link,
// bookmark, delete/report, avatar → profile modal.

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Flag, Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { toggleLike, deletePost, toggleBookmark as apiToggleBookmark, reportPost } from "@/api/Communityapi";
import { Avatar, Tag, timeAgo, AuthorName, CARD_SURFACE } from "./ui";
import MediaGallery from "./components/mediaGallery";
import { renderRichText } from "@/utils/richText";
import { translatePostText, guessLanguage, otherLang } from "@/api/translateapi";

const countLikes = (post) => post.likesCount ?? post.likes?.length ?? 0;
const countComments = (post) => post.commentsCount ?? post.comments?.length ?? 0;

// Shared class for plain icon-only action buttons — no background, no
// shadow, just an icon with a subtle hover state.
const ICON_BTN =
  "flex items-center justify-center gap-1.5 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50";

const PostCard = ({ post, onLikeToggled, onDeleted, onBookmarkToggled }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked));
  const [likesCount, setLikesCount] = useState(countLikes(post));
  const [commentsCount, setCommentsCount] = useState(countComments(post));

  // FEATURE 4 — this is the ONLY place `liked` is computed, and it is
  // derived strictly from whether the CURRENT user's id appears in
  // post.likes. It never reads a shared/global boolean, so one user's like
  // can never visually "leak" onto another user's screen.
  const [liked, setLiked] = useState(
    () => Boolean(user) && post.likes?.some((id) => String(id) === String(user._id) || String(id?._id) === String(user._id))
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // FEATURE 3 — translation state
  const [translated, setTranslated] = useState(null); // { translatedText, sourceLang, targetLang }
  const [showingTranslation, setShowingTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const sourceLangGuess = translated?.sourceLang ?? guessLanguage(post.content || "");
  const targetLang = otherLang(sourceLangGuess);

  useEffect(() => {
    setLikesCount(countLikes(post));
    setCommentsCount(countComments(post));
    setBookmarked(Boolean(post.bookmarked));
    setLiked(Boolean(user) && post.likes?.some((id) => String(id) === String(user._id) || String(id?._id) === String(user._id)));
  }, [post, user]);

  useEffect(() => {
    const onLike = (e) => {
      const { postId, likesCount: n, userId, liked: remoteLiked } = e.detail ?? {};
      if (postId !== post._id) return;
      setLikesCount(n);
      // Only apply the liked/unliked visual state if THIS event is about
      // the CURRENT user — other users' like events must never toggle our
      // own heart icon.
      if (user && String(userId) === String(user._id)) setLiked(remoteLiked);
    };
    const onComment = (e) => {
      const { postId, commentsCount: n } = e.detail ?? {};
      if (postId === post._id) setCommentsCount(n);
    };
    window.addEventListener("community:post-like", onLike);
    window.addEventListener("community:comment-new", onComment);
    window.addEventListener("community:comment-deleted", onComment);
    return () => {
      window.removeEventListener("community:post-like", onLike);
      window.removeEventListener("community:comment-new", onComment);
      window.removeEventListener("community:comment-deleted", onComment);
    };
  }, [post._id, user]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isOwner = user && (String(post.author?._id) === String(user._id) || user.role === "admin");

  const handleLike = async (e) => {
    e.preventDefault();
    if (liking || !user) return;
    setLiking(true);
    try {
      const data = await toggleLike(post._id);
      if (data.success) {
        // Trust only the response fields that are scoped to this request
        // (made by and about the current user), never a cached/shared flag.
        setLiked(data.liked);
        setLikesCount(data.likesCount);
        onLikeToggled?.(post._id, data.liked, data.likesCount);
      }
    } catch {
      toast.error(t["feed.likeError"] ?? "Could not update like.");
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const data = await apiToggleBookmark(post._id);
      if (data.success) {
        setBookmarked(data.bookmarked);
        onBookmarkToggled?.(post._id, data.bookmarked);
        toast.success(data.bookmarked
          ? (t["bookmarks.saved"] ?? "Post saved")
          : (t["bookmarks.removed"] ?? "Bookmark removed"));
      }
    } catch {
      toast.error(t["bookmarks.error"] ?? "Could not update bookmark.");
    } finally {
      setBookmarking(false);
    }
  };

  const copyLink = async (e) => {
    e?.preventDefault?.();
    const url = `${window.location.origin}/community/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t["feed.linkCopied"] ?? "Link copied!");
    } catch {
      toast.error(t["feed.copyFailed"] ?? "Could not copy link.");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (deleting) return;
    if (!window.confirm(t["feed.deleteConfirm"] ?? "Delete this post?")) return;
    setDeleting(true);
    try {
      const data = await deletePost(post._id);
      if (data.success) {
        toast.success(t["feed.deleted"] ?? "Post deleted.");
        onDeleted?.(post._id);
      }
    } catch {
      toast.error(t["feed.deleteError"] ?? "Could not delete post.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (reporting) return;
    const reason = window.prompt(t["feed.reportReason"] ?? "Why are you reporting this post? (spam, harassment, fake, violence, other)");
    if (!reason?.trim()) return;
    setReporting(true);
    try {
      const data = await reportPost(post._id, reason.trim());
      if (data.success) {
        toast.success(t["feed.reported"] ?? "Report submitted. Admins will review it.");
      }
    } catch {
      toast.error(t["feed.reportError"] ?? "Could not submit report.");
    } finally {
      setReporting(false);
    }
  };

  // FEATURE 3 — translate on demand, cache the result, allow toggling back.
  const handleTranslate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (translating) return;

    if (translated) {
      // Already translated once — just flip the display, no new request.
      setShowingTranslation((s) => !s);
      return;
    }

    setTranslating(true);
    try {
      const result = await translatePostText(post._id, post.content || "", targetLang);
      setTranslated(result);
      setShowingTranslation(true);
    } catch {
      toast.error(t["feed.translateError"] ?? "Could not translate this post.");
    } finally {
      setTranslating(false);
    }
  };

  const rawText = post.content || "";
  const displayText = showingTranslation && translated ? translated.translatedText : rawText;
  const snippet = displayText.slice(0, 300) + (displayText.length > 300 ? "…" : "");

  return (
    <article className={`${CARD_SURFACE} mb-4 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <button onClick={() => navigate(`/community/user/${post.author._id}`)}>
          <Avatar photo={post.author?.photo || post.author?.avatar || null} />
        </button>
        <div className="flex-1 min-w-0">
          <button 
            type="button"
            onClick={() => navigate(`/community/user/${post.author._id}`)}
            className="text-[14px] font-bold text-gray-900 dark:text-white hover:underline text-left block truncate"
          >
            <AuthorName user={post.author} />
          </button>
          <span className="text-[12px] text-gray-400">{timeAgo(post.createdAt, t)}</span>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen((s) => !s)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-30">
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label={t["feed.copyLink"] ?? "Copy link"}
              >
                <Share2 size={15} />
              </button>
              {!isOwner && (
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="w-full flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  aria-label={t["feed.report"] ?? "Report"}
                >
                  <Flag size={15} />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  aria-label={t["feed.delete"] ?? "Delete"}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        onClick={() => navigate(`/community/post/${post._id}`)}
        className="block px-4 pb-1.5 cursor-pointer"
      >
        {post.title && (
          <h2 className="text-[16px] sm:text-[17px] font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
            {post.title}
          </h2>
        )}
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {renderRichText(snippet)}
        </p>
      </div>

      {/* FEATURE 3 — translate control: icon only, no background, no label */}
      {rawText.trim().length > 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={handleTranslate}
            disabled={translating}
            className={ICON_BTN}
            aria-label={
              translating
                ? (t["feed.translating"] ?? "Translating…")
                : showingTranslation
                  ? (t["feed.seeOriginal"] ?? "See original")
                  : targetLang === "en"
                    ? (t["feed.translateToEnglish"] ?? "Translate to English")
                    : (t["feed.translateToSomali"] ?? "Translate to Somali")
            }
          >
            {translating ? <Loader2 size={15} className="animate-spin" /> : <Languages size={15} />}
          </button>
        </div>
      )}

      {/* Media / documents */}
      <MediaGallery attachments={post.attachments} legacyImage={post.image} size="feed" />

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2">
          {post.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      )}

      {/* Stats */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="flex items-center gap-3 px-4 py-2 text-[12px] text-gray-400">
          {likesCount > 0 && <span>{likesCount} {t["feed.like"] ?? "Like"}{likesCount !== 1 ? "s" : ""}</span>}
          {commentsCount > 0 && <span>{commentsCount} {t["feed.comments"] ?? "Comments"}</span>}
        </div>
      )}

      {/* Actions — plain icon-only buttons, no background/shadow, no text */}
      <div className="flex items-center justify-around border-t border-gray-100 dark:border-gray-800 mx-2 py-1">
        <button
          onClick={handleLike}
          disabled={liking}
          className={ICON_BTN}
          aria-label={liked ? (t["feed.liked"] ?? "Liked") : (t["feed.like"] ?? "Like")}
        >
          <Heart size={18} className={liked ? "fill-current text-red-500" : ""} />
        </button>

        <Link
          to={`/community/post/${post._id}#comments`}
          className={ICON_BTN}
          aria-label={t["feed.comment"] ?? "Comment"}
        >
          <MessageCircle size={18} />
        </Link>

        <button onClick={copyLink} className={ICON_BTN} aria-label={t["feed.share"] ?? "Share"}>
          <Share2 size={18} />
        </button>

        <button
          onClick={handleBookmark}
          disabled={bookmarking}
          className={ICON_BTN}
          aria-label="Bookmark"
        >
          <Bookmark size={18} className={bookmarked ? "fill-current" : ""} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;