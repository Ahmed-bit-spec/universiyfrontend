// pages/MyLibrary.jsx — Uniso E-Library v2
// All data from MongoDB. No mock data. No localStorage for user state.
// Requires usee-library hook with useMyLibrary()

import { useState } from "react";
import { useNavigate }   from "react-router-dom";
import { Heart, Bookmark, BookOpen, Clock, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage }   from "@/hooks/useLanguage";
import { useMyLibrary, useELibrary } from "@/hooks/usee-library";

// ── Cover component ───────────────────────────────────────────────────────────
const GRADIENTS = [
  ["#1a1a2e", "#16213e"], ["#0f3460", "#533483"],
  ["#1b262c", "#0f3460"], ["#2d6a4f", "#1b4332"],
  ["#3d405b", "#2b2d42"], ["#6b2737", "#2d1b33"],
];
const hash = (s = "") => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

const Cover = ({ src, title, size = "md" }) => {
  const [err, setErr] = useState(false);
  const [c1, c2] = GRADIENTS[hash(title) % GRADIENTS.length];
  const dim = size === "sm"
    ? { width: "44px", height: "60px" }
    : { width: "54px", height: "74px" };

  if (!src || err) return (
    <div style={{ ...dim, borderRadius: "8px", background: `linear-gradient(160deg, ${c1}, ${c2})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.14)" }}>
      <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "20px", fontFamily: "'Georgia', serif" }}>
        {(title || "?")[0].toUpperCase()}
      </span>
    </div>
  );

  return (
    <img
      src={src.startsWith("http") ? src : `${import.meta.env.VITE_API_BASE_URL ?? ""}/${src.replace(/^\//, "")}`}
      alt={title}
      onError={() => setErr(true)}
      style={{ ...dim, borderRadius: "8px", objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
    />
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, title, sub }) => (
  <div style={{ padding: "56px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
      <Icon size={22} color="#cbd5e1" />
    </div>
    <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>{title}</p>
    <p style={{ fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.55 }}>{sub}</p>
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ percent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
    <div style={{ flex: 1, height: "3px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden", maxWidth: "90px" }}>
      <div style={{ height: "100%", background: "#2C2DE0", borderRadius: "2px", width: `${percent}%`, transition: "width 0.4s" }} />
    </div>
    <span style={{ fontSize: "10px", color: "#2C2DE0", fontWeight: 800, minWidth: "28px", fontVariantNumeric: "tabular-nums" }}>{percent}%</span>
  </div>
);

// ── Book row ──────────────────────────────────────────────────────────────────
const BookRow = ({ book, right, sub, badge }) => {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  if (!book) return null;

  return (
    <div
      onClick={() => navigate(`/e-library/reader/${book._id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "12px 14px", borderRadius: "14px", cursor: "pointer",
        background: hov ? "#f8fafc" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <Cover src={typeof book.coverImage === "object" ? book.coverImage?.url : book.coverImage} title={book.title} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <p style={{
            fontSize: "13.5px", fontWeight: 700, lineHeight: 1.3,
            color: hov ? "#2C2DE0" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            transition: "color 0.15s", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em",
          }}>
            {book.title}
          </p>
          {badge}
        </div>
        <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.author}
        </p>
        {sub}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      <ChevronRight size={14} color={hov ? "#2C2DE0" : "#cbd5e1"} style={{ flexShrink: 0, transition: "color 0.15s" }} />
    </div>
  );
};

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "favorites", label: "Favorites",        icon: Heart,    emptyTitle: "No favorites yet",    emptySub: "Tap the heart on any book to save it here" },
  { id: "continue",  label: "Continue Reading", icon: BookOpen, emptyTitle: "Nothing in progress", emptySub: "Open a book to start reading" },
  { id: "recent",    label: "Recently Read",    icon: Clock,    emptyTitle: "No reading history",  emptySub: "Books you open will appear here" },
  { id: "bookmarks", label: "Bookmarks",        icon: Bookmark, emptyTitle: "No bookmarks saved",  emptySub: "Bookmark pages while reading to find them here" },
];

// ─── MyLibrary ────────────────────────────────────────────────────────────────
const MyLibrary = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("favorites");
  const { favorites, continueReading, recentlyRead, bookmarks, isLoading, error } = useMyLibrary();
  const { toggleFavorite } = useELibrary();

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid #2C2DE0", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading your library…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", padding: "0 24px" }}>
        <AlertCircle size={28} color="#ef4444" />
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Failed to load your library</p>
        <button onClick={() => window.location.reload()} style={{ color: "#2C2DE0", fontSize: "13px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </div>
  );

  const counts = {
    favorites: favorites.length,
    continue:  continueReading.length,
    recent:    recentlyRead.length,
    bookmarks: bookmarks.length,
  };

  const active = TABS.find((t) => t.id === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", paddingBottom: "80px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "36px 20px 0", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "'Georgia', serif", margin: "0 0 5px" }}>
            My Library
          </h1>
          <p style={{ fontSize: "13.5px", color: "#94a3b8", fontWeight: 400 }}>
            Your personal reading space — everything synced across devices.
          </p>
        </div>

        {/* Tab stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "7px",
                padding: "16px 8px", borderRadius: "16px",
                border: activeTab === id ? "1.5px solid rgba(22,163,74,0.3)" : "1px solid #f1f0ed",
                background: activeTab === id ? "rgba(22,163,74,0.04)" : "#ffffff",
                cursor: "pointer", transition: "all 0.18s",
                boxShadow: activeTab === id ? "0 2px 12px rgba(22,163,74,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Icon size={18} color={activeTab === id ? "#2C2DE0" : "#d1d5db"} style={{ transition: "color 0.18s" }} />
              <span style={{ fontSize: "22px", fontWeight: 900, color: activeTab === id ? "#0f172a" : "#94a3b8", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {counts[id]}
              </span>
              <span style={{ fontSize: "9px", color: activeTab === id ? "#64748b" : "#cbd5e1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.3 }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Section header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            {active && <active.icon size={15} color="#2C2DE0" />}
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.025em", fontFamily: "'Georgia', serif" }}>
              {active?.label}
            </h2>
            <span style={{ fontSize: "10.5px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 9px", borderRadius: "12px", fontWeight: 700 }}>
              {counts[activeTab]}
            </span>
          </div>
          <div style={{ height: "1px", background: "#f1f0ed" }} />
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>

          {activeTab === "favorites" && (
            favorites.length === 0
              ? <Empty icon={Heart} title={active.emptyTitle} sub={active.emptySub} />
              : favorites.map((book) => (
                <BookRow key={book._id} book={book}
                  right={
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(book._id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                      <Heart size={15} style={{ fill: "#2C2DE0", color: "#2C2DE0" }} />
                    </button>
                  }
                />
              ))
          )}

          {activeTab === "continue" && (
            continueReading.length === 0
              ? <Empty icon={BookOpen} title={active.emptyTitle} sub={active.emptySub} />
              : continueReading.map((prog) => {
                  const book = prog.bookId;
                  if (!book || typeof book === "string") return null;
                  return (
                    <BookRow key={prog._id} book={book}
                      sub={<ProgressBar percent={prog.percent} />}
                      right={<span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>p.{prog.lastPage}</span>}
                    />
                  );
                })
          )}

          {activeTab === "recent" && (
            recentlyRead.length === 0
              ? <Empty icon={Clock} title={active.emptyTitle} sub={active.emptySub} />
              : recentlyRead.map((prog) => {
                  const book = prog.bookId;
                  if (!book || typeof book === "string") return null;
                  const date = prog.lastReadAt
                    ? new Date(prog.lastReadAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—";
                  return (
                    <BookRow key={prog._id} book={book}
                      right={<span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 500 }}>{date}</span>}
                      sub={prog.percent > 0 ? <ProgressBar percent={prog.percent} /> : null}
                    />
                  );
                })
          )}

          {activeTab === "bookmarks" && (
            bookmarks.length === 0
              ? <Empty icon={Bookmark} title={active.emptyTitle} sub={active.emptySub} />
              : bookmarks.map((bm) => {
                  const book = bm.bookId;
                  if (!book || typeof book === "string") return null;
                  return (
                    <BookRow key={bm._id} book={book}
                      sub={bm.note ? <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "3px 0 0" }}>{bm.note}</p> : null}
                      right={<span style={{ fontSize: "13px", fontWeight: 800, color: "#2C2DE0", fontVariantNumeric: "tabular-nums" }}>p.{bm.page}</span>}
                    />
                  );
                })
          )}

        </div>
      </div>
    </div>
  );
};

export default MyLibrary;