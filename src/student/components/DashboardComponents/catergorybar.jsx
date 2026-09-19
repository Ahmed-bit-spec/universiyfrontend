// catergorybar.jsx — UniLibrary design system
// Fixed: dark mode (CSS variables instead of hardcoded bg-white dark:bg-gray-900),
//        bilingual label fallback guard,
//        spacing tightened
// v2: active category pill now uses the shared 3D pill style
//     (bg-[#2C2DE0], shadow-[0_4px_0_#1E1FAA], presses down on click)

import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { CATEGORY_KEYS, CATEGORY_ICONS } from "@/hooks/usee-library";

const SLUG_LABELS = {
  all:           "All",
  fiction:       "Fiction",
  "non-fiction": "Non-Fiction",
  science:       "Science",
  technology:    "Technology",
  history:       "History",
  biography:     "Biography",
  philosophy:    "Philosophy",
  religion:      "Religion",
  law:           "Law",
  medicine:      "Medicine",
  economics:     "Economics",
  arts:          "Arts",
  language:      "Language",
  children:      "Children",
  poetry:        "Poetry",
  travel:        "Travel",
  psychology:    "Psychology",
  education:     "Education",
  politics:      "Politics",
};

// Shared 3D primary style, expressed as inline styles (this file doesn't use Tailwind)
const PRIMARY_GREEN = "#2C2DE0";
const PRIMARY_SHADOW = "0 4px 0 #1E1FAA";
const PRIMARY_SHADOW_PRESSED = "0 2px 0 #1E1FAA";

const CategoryBar = ({ activeCategory, onSelect }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  return (
    <div style={{ position: "relative" }}>
      {/* Left fade — uses CSS variable so it works in dark mode */}
      <div style={{
        pointerEvents: "none",
        position: "absolute", left: 0, top: 0, bottom: 0, width: "40px", zIndex: 10,
        background: "linear-gradient(to right, var(--color-background-primary), transparent)",
      }} />
      {/* Right fade */}
      <div style={{
        pointerEvents: "none",
        position: "absolute", right: 0, top: 0, bottom: 0, width: "40px", zIndex: 10,
        background: "linear-gradient(to left, var(--color-background-primary), transparent)",
      }} />

      <div
        ref={scrollRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          padding: "4px 4px 8px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {CATEGORY_KEYS.map(({ slug, key }) => {
          const isActive = activeCategory === slug;
          const icon = CATEGORY_ICONS[slug];

          const label = (t[key] && t[key].trim())
            ? t[key]
            : (SLUG_LABELS[slug] ?? slug);

          return (
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              key={slug}
              onClick={() => onSelect(slug)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                padding: isActive ? "8px 16px" : "8px 16px",
                borderRadius: "var(--border-radius-lg)",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                flexShrink: 0,
                cursor: "pointer",
                transition: "all 0.15s",
                border: isActive
                  ? "none"
                  : "0.5px solid var(--color-border-tertiary)",
                background: isActive
                  ? PRIMARY_GREEN
                  : "var(--color-background-primary)",
                color: isActive
                  ? "#fff"
                  : "var(--color-text-secondary)",
                boxShadow: isActive ? PRIMARY_SHADOW : "none",
                transform: isActive ? "translateY(0)" : "scale(1)",
              }}
              onMouseDown={(e) => {
                if (isActive) {
                  e.currentTarget.style.boxShadow = PRIMARY_SHADOW_PRESSED;
                  e.currentTarget.style.transform = "translateY(2px)";
                }
              }}
              onMouseUp={(e) => {
                if (isActive) {
                  e.currentTarget.style.boxShadow = PRIMARY_SHADOW;
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.boxShadow = PRIMARY_SHADOW_PRESSED;
                  e.currentTarget.style.transform = "translateY(2px)";
                } else {
                  e.currentTarget.style.borderColor = "var(--color-border-secondary)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                  e.currentTarget.style.background = "var(--color-background-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (isActive) {
                  e.currentTarget.style.boxShadow = PRIMARY_SHADOW;
                  e.currentTarget.style.transform = "translateY(0)";
                } else {
                  e.currentTarget.style.borderColor = "var(--color-border-tertiary)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                  e.currentTarget.style.background = "var(--color-background-primary)";
                }
              }}
            >
              <span style={{ fontSize: "15px", lineHeight: 1 }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;