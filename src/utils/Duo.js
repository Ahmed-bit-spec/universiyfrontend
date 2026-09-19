// Shared "raised" primary button treatment used across the whole roadmap
// feature (Create, Publish, Add topic, Mark complete, active filter pill…).
// Keep every primary action consistent by importing this instead of
// re-typing the class string per button.
export const DUO_BUTTON =
  "bg-[#58CC02] text-white text-sm font-bold shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none";

// Same treatment but for buttons that are already "on"/selected (no lift
// needed on hover since there's nowhere further to press) — used for things
// like an active filter pill.
export const DUO_BUTTON_FLAT =
  "bg-[#58CC02] text-white text-sm font-bold shadow-[0_4px_0_#46A302] transition-all duration-150";