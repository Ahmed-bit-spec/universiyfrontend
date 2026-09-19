// src/components/Logo.jsx
// Usage: <UnicoreLogo size="md" />
//
// Fixes vs previous version:
//  1. Fixed pixel heights (h-9/h-12/h-16) didn't scale down on narrow
//     phones, so on small viewports the logo could clip or force the
//     navbar to overflow. Each size now has a mobile-first height that
//     grows at `sm:`, so it always fits inside the fixed h-14 header.
//  2. img now has `shrink-0` so a long "Uni CORE" wordmark never
//     squashes the mark on narrow flex containers.
//  3. Wordmark uses `whitespace-nowrap` + `leading-none` so it can't
//     wrap onto two lines and break the header's vertical rhythm.
//  4. `isLight` prop accepted (Header already passes it) — currently a
//     no-op since color is handled by Tailwind's dark: variants, but
//     kept in the signature so passing it doesn't throw/warn and it's
//     available if a future non-dark-mode-based theme is needed.

import unicLogo from "/images/logouniso.png";

const sizes = {
  sm: { text: "text-lg sm:text-xl", img: "h-7 sm:h-9" },   // mobile drawer header
  md: { text: "text-xl sm:text-2xl", img: "h-9 sm:h-12" }, // main navbar
  lg: { text: "text-2xl sm:text-4xl", img: "h-11 sm:h-16" }, // footer / hero / large placements
};

const UnicoreLogo = ({ size = "md", isLight, className = "" }) => {
  const s = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center gap-2 mt-2 select-none min-w-0 ${className}`}>
      <img
        src={unicLogo}
        alt="UNICORE"
        className={`${s.img} w-auto shrink-0 object-contain`}
      />
      <span className={`${s.text} font-bold tracking-tight leading-none whitespace-nowrap`}>
        <span className="text-black dark:text-white">Uni</span>
        <span style={{ color: "#2C2DE0" }}>CORE</span>
      </span>
    </span>
  );
};

export default UnicoreLogo;