// client/utils/notificationTime.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for relative-time formatting across the entire
// notification system. Import `relativeTime` everywhere instead of inlining.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a human-friendly relative time string.
 *
 * Examples:
 *   Just now · 2 minutes ago · 1 hour ago · 3 hours ago ·
 *   Yesterday · 2 days ago · 1 week ago · 2 months ago
 *
 * @param {string|Date} date — ISO string or Date object
 * @returns {string}
 */
export const relativeTime = (date) => {
  if (!date) return "";

  const now     = Date.now();
  const then    = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 5)   return "Just now";
  if (seconds < 60)  return `${seconds} seconds ago`;
  if (seconds < 120) return "1 minute ago";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24)  return `${hours} hours ago`;

  // Calendar-aware "Yesterday"
  const thenDate = new Date(then);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (thenDate >= yesterdayStart && thenDate < todayStart) {
    return "Yesterday";
  }

  const days = Math.floor(hours / 24);
  if (days < 7)  return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1)  return "1 week ago";
  if (weeks < 4)   return `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12)  return `${months} months ago`;

  const years = Math.floor(days / 365);
  if (years === 1) return "1 year ago";
  return `${years} years ago`;
};

/**
 * Formats an absolute date for notification detail views.
 * e.g. "Mon, Jun 9 at 2:45 PM"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const absoluteTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
};