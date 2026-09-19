// src/components/community/ui.jsx
// Shared micro-components used across Community
//
// FIX: added resolveMediaUrl, a sibling to resolvePhoto that does the same
// "make this a full URL against the API origin" job, but for post
// attachments (images/videos/pdfs). Attachments come back from the server
// as relative paths like "uploads/community/xyz.mp4" — used raw as an <img>
// or <video> src, the browser resolves them against the current PAGE origin
// instead of the API origin, so nothing loads. resolvePhoto already solved
// this exact problem for avatars; attachments just never got the same
// treatment. PostCard.jsx and PostDetail.jsx now run every attachment URL
// through this before using it as src/href.

import React from "react";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Duolingo-style primary button — used across community */
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 " +
  "bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] " +
  "hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] " +
  "active:translate-y-1 active:shadow-none transition-all duration-150 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-[0_4px_0_#1E1FAA]";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 " +
  "text-sm font-bold border border-gray-200 dark:border-gray-700 " +
  "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 " +
  "hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150";

export const CARD_SURFACE =
  "rounded-2xl border border-gray-100 dark:border-gray-800 " +
  "bg-white dark:bg-gray-950 shadow-sm";

export const resolvePhoto = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("blob:") || photo.startsWith("http")) return photo;
  return BASE ? `${BASE}/${photo}` : `/${photo}`;
};

// Same job as resolvePhoto, generalized for any attachment url (image,
// video, pdf). Leaves blob:/http(s):/data: URLs (local previews, or URLs
// already absolute) untouched; otherwise prefixes with the API origin,
// stripping any accidental leading slash so we never get "//uploads".
export const resolveMediaUrl = (url) => {
  if (!url) return url;
  if (/^(blob:|https?:|data:)/.test(url)) return url;
  const clean = url.replace(/^\/+/, "");
  return BASE ? `${BASE}/${clean}` : `/${clean}`;
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export const timeAgo = (dateStr, t) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t?.["feed.justNow"] ?? "Just now";
  if (mins < 60) return `${mins}${t?.["feed.minAgo"] ?? "m ago"}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t?.["feed.hourAgo"] ?? "h ago"}`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}${t?.["feed.dayAgo"] ?? "d ago"}`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const readTime = (content = "") =>
  Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

/** UNISO verified — linked in User model or university DB (student/teacher) */
export const isUserVerified = (user) => {
  if (!user) return false;
  if (user.unisoVerified) return true;
  const hasId = Boolean(user.universityId || user.studentId);
  const verified = Boolean(user.isUniversityVerified || user.universityVerified);
  if (user.role === "teacher" && hasId) return true;
  return hasId && verified;
};

export const VerifiedBadge = ({ className = "" }) => (
  <svg
    viewBox="0 0 16 16"
    className={`inline-block w-3.5 h-3.5 flex-shrink-0 ${className}`}
    title="UNISO Verified"
    aria-label="Verified"
  >
    <circle cx="8" cy="8" r="8" className="fill-[#2C2DE0]" />
    <path
      d="M4.5 8.2l2 2 5-4.5"
      fill="none"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AuthorName = ({ user, className = "" }) => (
  <span className={`inline-flex items-center gap-1 min-w-0 ${className}`}>
    <span className="truncate">{user?.name ?? "Unknown"}</span>
    {isUserVerified(user) && <VerifiedBadge />}
  </span>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name, photo, size = 36, ring = false }) => {
  const url = resolvePhoto(photo);
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`rounded-full bg-gradient-to-br from-[#2C2DE0] to-[#1E1FAA] text-white font-bold overflow-hidden flex items-center justify-center flex-shrink-0 ${
        ring ? "ring-2 ring-white dark:ring-black" : ""
      }`}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.textContent = getInitials(name);
          }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

// ── Tag pill ──────────────────────────────────────────────────────────────────
export const Tag = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className=" text-gray-500 text-sm  active:translate-y-1 active:shadow-none transition-all duration-150 group"
  >
    #{label}
  </button>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, className = "" }) => (
  <svg
    className={`animate-spin ${className}`}
    style={{ width: size, height: size }}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ className = "" }) => (
  <div className={`border-t border-gray-100 dark:border-gray-800 ${className}`} />
);