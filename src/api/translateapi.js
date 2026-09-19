// translationApi — client for Feature 3 (post translation)
//
// NEW BACKEND ENDPOINT REQUIRED (same convention as the rest of
// communityApi.js, e.g. `/posts/${id}/report`, `/posts/${id}/bookmark`):
//   POST /posts/:id/translate   { targetLang: "en" | "so" }
//   → { success: true, translatedText, sourceLang, targetLang }
//
// The backend should:
//   1. Detect the source language of post.content (or reuse a stored value).
//   2. Translate to targetLang using your provider of choice (Google
//      Translate API, LibreTranslate, DeepL, Azure Translator, etc).
//   3. Return the detected sourceLang so the client can flip the button
//      label ("Translate to English" ↔ "Translate to Somali") without
//      re-detecting on every render.
//
// This file also exposes a tiny client-side heuristic so the button shows a
// sensible label instantly, before the first API round-trip.

import api from "@/api/client"; // same client communityApi.js uses (relative /api paths, cookie session)

// In-memory cache so we never translate the same post/language twice in a
// session, per Feature 3's "do not translate twice unnecessarily" rule.
const translationCache = new Map();

const SOMALI_HINTS = [
  " waa ", " waxaan ", " waxay ", " ku ", " iyo ", " maanta ", " ayaa ",
  " kaaga ", " kuwa ", " dhamm", " ardayga ", " jaamacad",
];

/**
 * Very small heuristic used only to pick an initial button label
 * ("Translate to English" vs "Translate to Somali") before the backend's
 * real language detection result comes back. Not used for anything else.
 */
export const guessLanguage = (text = "") => {
  const lower = ` ${text.toLowerCase()} `;
  const somaliHits = SOMALI_HINTS.filter((w) => lower.includes(w)).length;
  return somaliHits >= 1 ? "so" : "en";
};

export const otherLang = (lang) => (lang === "so" ? "en" : "so");

/**
 * Translate a post's text, with caching keyed by postId + targetLang so the
 * same translation is never requested twice.
 */
export const translatePostText = async (postId, text, targetLang) => {
  const cacheKey = `${postId}:${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const { data } = await api.post(`/posts/${postId}/translate`, {
    targetLang,
  });

  if (data?.success) {
    const result = {
      translatedText: data.translatedText,
      sourceLang: data.sourceLang || guessLanguage(text),
      targetLang,
    };
    translationCache.set(cacheKey, result);
    return result;
  }

  throw new Error(data?.message || "Translation failed");
};

export const clearTranslationCache = (postId) => {
  if (!postId) return translationCache.clear();
  for (const key of Array.from(translationCache.keys())) {
    if (key.startsWith(`${postId}:`)) translationCache.delete(key);
  }
};