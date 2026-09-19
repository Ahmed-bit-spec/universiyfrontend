// Full post view with comments, replies, edit, report
//
// CHANGES in this pass (see prompt "Community Feed Enhancement"):
//   FEATURE 3 — Translate button under the post body (Somali ⇄ English).
//   FEATURE 4 — `liked` is derived strictly from post.likes vs current
//     user._id (see the comment at its definition below) — never from a
//     shared/global flag.
//   FEATURE 5/6 — PostMedia replaced by <MediaGallery size="detail">, which
//     renders the responsive grid and owns the fullscreen MediaViewer.
//   STYLE PASS — removed the leftover bg-[#2C2DE0]/shadow "game button"
//     classes from every action/icon button (several had ended up with a
//     duplicate className, where the blue-background one was always dead
//     code since JSX keeps only the last className). No new behavior added.
//
// Comment thread, edit flow, and everything else is unchanged.

import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, Bookmark, Share2,
  ArrowLeft, Send, Trash2, Loader2, Flag, Pencil, CornerDownRight,
  Languages,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import {
  getPost, toggleLike, addComment, deleteComment, toggleBookmark,
  replyToComment, updatePost, reportPost, updateComment
} from "@/api/Communityapi";
import { Avatar, Tag, timeAgo, Spinner, Divider, AuthorName, BTN_PRIMARY, BTN_SECONDARY, CARD_SURFACE } from "@/community/ui";
import MediaGallery from "@/community/components/mediaGallery";
import { renderRichText } from "@/utils/richText";
import { translatePostText, guessLanguage, otherLang } from "@/api/translateapi";

// ── Comment Item (supports replies) ─────────────────────────────────────────
const CommentItem = ({ comment, currentUser, postId, onDeleted, onReplyAdded, t, depth = 0 }) => {
  const [deleting, setDeleting] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.text ?? comment.content ?? "");
  const [sending, setSending] = useState(false);

  const isOwner = currentUser &&
    (String(comment.author?._id) === String(currentUser._id) || currentUser.role === "admin");

  const handleDelete = async () => {
    if (deleting || !window.confirm(t["feed.deleteCommentConfirm"] ?? "Delete this comment?")) return;
    setDeleting(true);
    try {
      const data = await deleteComment(postId, comment._id);
      if (data.success) onDeleted(comment._id, data.commentsCount);
    } catch {
      toast.error(t["feed.deleteCommentError"] ?? "Could not delete comment.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const data = await replyToComment(postId, comment._id, replyText.trim());
      if (data.success) {
        onReplyAdded?.(data.comment, data.commentsCount);
        setReplyText("");
        setReplying(false);
      }
    } catch {
      toast.error(t["feed.errorComment"] ?? "Couldn't add comment.");
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || sending) return;
    setSending(true);
    try {
      const data = await updateComment(postId, comment._id, editText.trim());
      if (data.success) {
        setEditing(false);
        toast.success(t["feed.commentUpdated"] ?? "Comment updated.");
      }
    } catch {
      toast.error(t["feed.errorComment"] ?? "Couldn't update comment.");
    } finally {
      setSending(false);
    }
  };

  const text = comment.text ?? comment.content ?? "";

  return (
    <div className={`${depth > 0 ? "ml-6 sm:ml-10 border-l-2 border-[#2C2DE0]/20 pl-3" : ""}`}>
      <div className="flex items-start gap-3 py-3">
        <Avatar name={comment.author?.name} photo={comment.author?.photo} size={depth > 0 ? 28 : 32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-bold text-gray-900 dark:text-white">
              <AuthorName user={comment.author} />
            </span>
            <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt, t)}</span>
            {comment.editedAt && (
              <span className="text-[10px] text-gray-400">({t["feed.edited"] ?? "edited"})</span>
            )}
            <div className="ml-auto flex items-center gap-1">
              {isOwner && !editing && (
                <>
                  <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-[#2C2DE0] transition-colors p-1">
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full rounded-xl px-3 py-2 text-[14px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleEdit} disabled={sending} className={BTN_PRIMARY + " !py-1.5 !px-3 !text-xs"}>
                  {t["feed.save"] ?? "Save"}
                </button>
                <button onClick={() => setEditing(false)} className={BTN_SECONDARY + " !py-1.5 !px-3 !text-xs"}>
                  {t["feed.cancel"] ?? "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
              {text}
            </p>
          )}

          {!editing && currentUser && (
            <button
              onClick={() => setReplying((s) => !s)}
              className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-[#2C2DE0] transition-colors"
            >
              <CornerDownRight size={12} />
              {t["feed.reply"] ?? "Reply"}
            </button>
          )}

          {replying && (
            <div className="mt-2 flex items-start gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t["feed.writeReply"] ?? "Write a reply…"}
                rows={2}
                className="flex-1 rounded-xl px-3 py-2 text-[13px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30 resize-none"
              />
              <button onClick={handleReply} disabled={!replyText.trim() || sending} className={BTN_PRIMARY + " !py-2 !px-3"}>
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          currentUser={currentUser}
          postId={postId}
          onDeleted={onDeleted}
          onReplyAdded={onReplyAdded}
          t={t}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

// ── Comment Form ──────────────────────────────────────────────────────────────
const CommentForm = ({ postId, currentUser, onAdded, t }) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const data = await addComment(postId, text.trim());
      if (data.success) { onAdded(data.comment ?? data.comments); setText(""); }
    } catch {
      toast.error(t["feed.errorComment"] ?? "Couldn't add comment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-start gap-3 mt-4">
      <button onClick={() => navigate(`/community/user/${currentUser?._id}`)}>
        <Avatar name={currentUser?.name} photo={currentUser?.photo} size={36} />
      </button>

      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
          placeholder={t["feed.writeComment"] ?? "Write a comment…"}
          rows={2}
          className="w-full pl-4 pr-12 py-3 rounded-xl text-[14px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30 resize-none transition-all leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="absolute right-2 bottom-2 p-2 rounded-full text-[#2C2DE0] hover:bg-[#2C2DE0]/10 disabled:opacity-40 disabled:text-gray-300 transition-colors"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
};

// ── Post Detail ───────────────────────────────────────────────────────────────
const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const commentsRef = useRef(null);

  // FEATURE 3 — translation state
  const [translated, setTranslated] = useState(null);
  const [showingTranslation, setShowingTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);

  const loadPost = () => {
    setLoading(true);
    getPost(id)
      .then((data) => {
        if (data.success) {
          setPost(data.post);
          setBookmarked(Boolean(data.post.bookmarked));
          setEditContent(data.post.content ?? "");
        } else {
          setError(t["feed.postNotFound"] ?? "Post not found.");
        }
      })
      .catch(() => setError(t["feed.errorLoad"] ?? "Could not load post."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPost(); }, [id]);

  useEffect(() => {
    const onLike = (e) => {
      const { postId, likesCount, userId, liked } = e.detail ?? {};
      if (postId !== id) return;
      setPost((prev) => {
        if (!prev) return prev;
        // Only mutate `likes` (and therefore the derived `liked` value below)
        // when this event is about the CURRENT user — see FEATURE 4 note.
        const isMe = user && String(userId) === String(user._id);
        return {
          ...prev,
          likesCount,
          likes: isMe
            ? (liked ? [...(prev.likes ?? []), user._id] : (prev.likes ?? []).filter((lid) => String(lid) !== String(user._id) && String(lid?._id) !== String(user._id)))
            : prev.likes,
        };
      });
    };
    const onComment = (e) => {
      const { postId, comment, commentsCount } = e.detail ?? {};
      if (postId !== id) return;
      setPost((prev) => {
        if (!prev) return prev;
        if (comment && !(prev.comments ?? []).some((c) => c._id === comment._id)) {
          return { ...prev, comments: [...(prev.comments ?? []), comment], commentsCount };
        }
        return { ...prev, commentsCount };
      });
    };
    const onCommentDel = (e) => {
      const { postId, commentId, commentsCount } = e.detail ?? {};
      if (postId !== id) return;
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments ?? []).filter((c) => c._id !== commentId),
        commentsCount,
      }));
    };
    window.addEventListener("community:post-like", onLike);
    window.addEventListener("community:comment-new", onComment);
    window.addEventListener("community:comment-deleted", onCommentDel);
    return () => {
      window.removeEventListener("community:post-like", onLike);
      window.removeEventListener("community:comment-new", onComment);
      window.removeEventListener("community:comment-deleted", onCommentDel);
    };
  }, [id, user]);

  // FEATURE 4 — the ONLY place `liked` is computed for the detail page.
  // Derived strictly from post.likes vs the current user's id.
  const liked = user && post?.likes?.some((lid) => String(lid) === String(user._id) || String(lid?._id) === String(user._id));
  const isOwner = user && (String(post?.author?._id) === String(user._id) || user.role === "admin");

  const handleLike = async () => {
    if (liking || !user || !post) return;
    setLiking(true);
    try {
      const data = await toggleLike(post._id);
      if (data.success) {
        setPost((prev) => ({
          ...prev,
          likesCount: data.likesCount,
          likes: data.liked
            ? [...(prev.likes ?? []), user._id]
            : (prev.likes ?? []).filter((lid) => lid !== user._id && lid?._id !== user._id),
        }));
      }
    } catch { }
    finally { setLiking(false); }
  };

  const handleBookmark = async () => {
    if (!post) return;
    try {
      const data = await toggleBookmark(post._id);
      if (data.success) {
        setBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? (t["bookmarks.saved"] ?? "Post saved") : (t["bookmarks.removed"] ?? "Bookmark removed"));
      }
    } catch {
      toast.error(t["bookmarks.error"] ?? "Could not update bookmark.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t["feed.linkCopied"] ?? "Link copied!");
    } catch {
      toast.error(t["feed.copyFailed"] ?? "Could not copy link.");
    }
  };

  const handleReport = async () => {
    const reason = window.prompt(t["feed.reportReason"] ?? "Why are you reporting? (spam, harassment, fake, violence, other)");
    if (!reason?.trim()) return;
    try {
      const data = await reportPost(post._id, reason.trim());
      if (data.success) toast.success(t["feed.reported"] ?? "Report submitted.");
    } catch {
      toast.error(t["feed.reportError"] ?? "Could not submit report.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    try {
      const data = await updatePost(post._id, { content: editContent.trim() });
      if (data.success) {
        setPost(data.post);
        setEditing(false);
        setTranslated(null);
        setShowingTranslation(false);
        toast.success(t["feed.postUpdated"] ?? "Post updated.");
      }
    } catch {
      toast.error(t["feed.errorPost"] ?? "Could not update post.");
    } finally {
      setSaving(false);
    }
  };

  const handleCommentAdded = (commentOrComments) => {
    setPost((prev) => {
      const existing = prev.comments ?? [];
      if (commentOrComments && !Array.isArray(commentOrComments)) {
        if (existing.some((c) => c._id === commentOrComments._id)) return prev;
        const updated = [...existing, commentOrComments];
        return { ...prev, comments: updated, commentsCount: updated.length };
      }
      const updated = Array.isArray(commentOrComments) ? commentOrComments : existing;
      return { ...prev, comments: updated, commentsCount: updated.length };
    });
  };

  const handleCommentDeleted = (commentId, commentsCount) => {
    setPost((prev) => {
      const updated = (prev.comments ?? []).filter((c) => c._id !== commentId);
      return { ...prev, comments: updated, commentsCount: commentsCount ?? updated.length };
    });
  };

  const handleReplyAdded = (reply, commentsCount) => {
    setPost((prev) => {
      const parentId = reply.parentComment;
      if (!parentId) {
        return { ...prev, comments: [...(prev.comments ?? []), reply], commentsCount };
      }
      const updated = (prev.comments ?? []).map((c) => {
        if (c._id === parentId) {
          return { ...c, replies: [...(c.replies ?? []), reply] };
        }
        return c;
      });
      return { ...prev, comments: updated, commentsCount };
    });
  };

  // FEATURE 3 — translate on demand, cache the result, allow toggling back.
  const handleTranslate = async () => {
    if (translating || !post) return;
    const sourceLangGuess = translated?.sourceLang ?? guessLanguage(post.content || "");
    const targetLang = otherLang(sourceLangGuess);

    if (translated) {
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

  const topLevelComments = (post?.comments ?? []).filter((c) => !c.parentComment);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Spinner size={20} className="text-[#2C2DE0] mr-2" />
        <span className="text-[14px]">{t["feed.loading"] ?? "Loading…"}</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || (t["feed.postNotFound"] ?? "Post not found.")}</p>
        <Link to="/community" className="text-[#2C2DE0] text-sm font-bold hover:underline">
          ← {t["feed.backToFeed"] ?? "Back to feed"}
        </Link>
      </div>
    );
  }

  const rawText = post.content || "";
  const displayText = showingTranslation && translated ? translated.translatedText : rawText;
  const sourceLangGuess = translated?.sourceLang ?? guessLanguage(rawText);
  const targetLang = otherLang(sourceLangGuess);
  const translateLabel = translating
    ? (t["feed.translating"] ?? "Translating…")
    : showingTranslation
      ? (t["feed.seeOriginal"] ?? "See original")
      : targetLang === "en"
        ? (t["feed.translateToEnglish"] ?? "Translate to English")
        : (t["feed.translateToSomali"] ?? "Translate to Somali");

  return (
    <article className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        {t["feed.back"] ?? "Back"}
      </button>

      <div className={`${CARD_SURFACE} p-4 sm:p-6`}>
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={() => setProfileOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40">
            <Avatar name={post.author?.name} photo={post.author?.photo} size={44} />
          </button>
          <div className="flex-1">
            <button type="button" onClick={() => setProfileOpen(true)} className="text-[14px] font-bold text-gray-900 dark:text-white hover:underline text-left">
              <AuthorName user={post.author} />
            </button>
            <p className="text-[12px] text-gray-400">
              {timeAgo(post.createdAt, t)}
              {post.editedAt && ` · ${t["feed.edited"] ?? "edited"}`}
            </p>
          </div>
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-gray-400 hover:text-[#2C2DE0] hover:bg-[#2C2DE0]/10 transition-colors">
              <Pencil size={16} />
            </button>
          )}
          {!isOwner && (
            <button
              onClick={handleReport}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Flag size={16} />
            </button>
          )}
        </div>

        {post.title && (
          <h1 className="text-[22px] sm:text-[26px] font-black text-gray-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>
        )}

        {editing ? (
          <div className="space-y-3 mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full rounded-xl px-4 py-3 text-[15px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30 resize-none"
            />
            <p className="text-[11px] text-gray-400">
              Tip: **bold**, *italic*, [link text](https://example.com)
            </p>
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} disabled={saving} className={BTN_PRIMARY}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {t["feed.save"] ?? "Save"}
              </button>
              <button onClick={() => setEditing(false)} className={BTN_SECONDARY}>
                {t["feed.cancel"] ?? "Cancel"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[15px] sm:text-[16px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words mb-2">
              {renderRichText(displayText)}
            </div>
            {/* FEATURE 3 — translate control */}
            {rawText.trim().length > 0 && (
              <button
                onClick={handleTranslate}
                disabled={translating}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-[#2C2DE0] transition-colors mb-3 disabled:opacity-50"
              >
                {translating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                {translateLabel}
              </button>
            )}
          </>
        )}

        {/* Media / documents */}
        <MediaGallery attachments={post.attachments} legacyImage={post.image} size="detail" />

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        )}

        <Divider className="mb-4" />

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            <Heart size={16} className={liked ? "fill-current text-red-500" : ""} />
            <span>{post.likesCount ?? post.likes?.length ?? 0}</span>
            <span className="hidden sm:inline">{liked ? (t["feed.liked"] ?? "Liked") : (t["feed.like"] ?? "Like")}</span>
          </button>

          <button
            onClick={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            <MessageCircle size={16} />
            <span>{post.commentsCount ?? post.comments?.length ?? 0}</span>
            <span className="hidden sm:inline">{t["feed.comment"] ?? "Comment"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">{t["feed.share"] ?? "Share"}</span>
          </button>

          <div className="flex-1" />

          <button
            onClick={handleBookmark}
            className="p-2.5 rounded-xl text-gray-400 hover:text-[#2C2DE0] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Comments */}
      <section ref={commentsRef} id="comments" className={`${CARD_SURFACE} p-4 sm:p-6 mt-4`}>
        <h2 className="text-[16px] font-black text-gray-900 dark:text-white mb-2">
          {t["feed.comments"] ?? "Comments"} ({post.commentsCount ?? post.comments?.length ?? 0})
        </h2>

        {user ? (
          <CommentForm postId={post._id} currentUser={user} onAdded={handleCommentAdded} t={t} />
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2">{t["feed.signInToComment"] ?? "Sign in to join the conversation."}</p>
            <Link to="/login" className="text-[13px] font-bold text-[#2C2DE0] hover:underline">
              {t["feed.signIn"] ?? "Sign in"}
            </Link>
          </div>
        )}

        <div className="mt-4 divide-y divide-gray-50 dark:divide-gray-900">
          {topLevelComments.length === 0 ? (
            <p className="text-[13px] text-gray-400 py-4">{t["feed.noComments"] ?? "No comments yet. Start the conversation."}</p>
          ) : (
            topLevelComments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                currentUser={user}
                postId={post._id}
                onDeleted={handleCommentDeleted}
                onReplyAdded={handleReplyAdded}
                t={t}
              />
            ))
          )}
        </div>
      </section>


    </article>
  );
};

export default PostDetail;