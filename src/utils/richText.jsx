// src/utils/richText.js
//
// Minimal Medium-style formatting for post content, stored as a plain string
// (still fits the existing `content: String, maxlength: 5000` schema field —
// no DB migration needed). Supports:
//   **bold**
//   *italic*
//   [link text](https://example.com)
//
// Input is HTML-escaped before any tag is generated, so this is safe to
// render directly — no dangerouslySetInnerHTML, no XSS risk.
//
// FIX (this version):
//   - Links now render in blue with an underline and actually navigate,
//     instead of being visually indistinguishable / unclickable.
//   - Links call stopPropagation() so clicking them doesn't also trigger
//     a parent's "open post" click handler (see PostCard.jsx fix).

import React from "react";

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Turns raw markdown-lite text into an array of React nodes.
 * Use directly as children: <p>{renderRichText(post.content)}</p>
 */
export const renderRichText = (raw = "") => {
  const escaped = escapeHtml(raw);
  const nodes = [];
  // Order matters: bold (**) must be tried before italic (*) so "**x**"
  // isn't swallowed by the italic pattern first.
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g;

  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(escaped)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(escaped.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
        >
          {match[3]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < escaped.length) {
    nodes.push(escaped.slice(lastIndex));
  }

  return nodes;
};