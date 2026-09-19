// HeroActions.jsx
// Primary/secondary CTAs (verify ID / reserve seat, browse library), plus
// SpiritBot's floating AI-assistant suggestion chips. All routes and
// labels are passed in from real app state — nothing hardcoded here
// beyond layout/styling.

import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarCheck, ListTodo, Bell, Sparkles } from "lucide-react";

const SUGGESTION_ICONS = {
  reserveSeat: CalendarCheck,
  continueLearning: BookOpen,
  searchBooks: BookOpen,
  todaysTasks: ListTodo,
  notifications: Bell,
  help: Sparkles,
};

export const HeroCTAs = ({ isGuest, t }) => (
  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
    <Link
      to={isGuest ? "/verify-university-id" : "/seats"}
      className="inline-flex items-center gap-2 bg-white text-[#2C2DE0] text-sm font-bold px-5 py-3 rounded-xl
        shadow-[0_4px_0_#E2F4D0] hover:translate-y-0.5 hover:shadow-[0_2px_0_#E2F4D0]
        active:translate-y-1 active:shadow-none transition-all duration-150"
    >
      {isGuest ? (t?.hero?.verifyCta || "Verify your ID") : (t?.hero?.reserveCta || "Reserve a seat")}
      <ArrowRight size={15} />
    </Link>
    <Link
      to="/e-library"
      className="inline-flex items-center gap-2 bg-white dark:bg-gray-900/15 text-black dark:text-white border border-white/30 text-sm font-bold px-5 py-3 rounded-xl
        hover:bg-white dark:bg-gray-900/25 transition-all duration-150"
    >
      {t?.hero?.browseCta || "Browse library"}
    </Link>
  </div>
);

// Floating suggestion chips that appear near SpiritBot once the greeting
// note has folded away — each maps to a real route/action.
export const AssistantSuggestions = ({ suggestions, onSelect, t }) => {
  if (!suggestions?.length) return null;
  return (
    <div className="hero-suggestions flex flex-wrap gap-1.5 justify-center lg:justify-start mt-2" role="list" aria-label={t?.hero?.assistantLabel || "AI assistant suggestions"}>
      {suggestions.map((s) => {
        const Icon = SUGGESTION_ICONS[s.id] || Sparkles;
        return (
          <button 
            key={s.id}
            type="button"
            role="listitem"
            onClick={() => onSelect?.(s)}
            className="inline-flex items-center gap-1 bg-white dark:bg-gray-900/15 hover:bg-white dark:bg-gray-900/25 text-black dark:text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full border border-white/20 transition-colors"
          >
            <Icon size={12} />
            {s.label}
          </button>
        );
      })}
      <style>{`
        .hero-suggestions { animation: enterTop 0.5s ease both; animation-delay: 0.1s; }
      `}</style>
    </div>
  );
};