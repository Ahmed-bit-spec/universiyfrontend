// components/herobanner.jsx — UniLibrary design system
import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { OwlMascot } from "./owlmoscot";
import { useLanguage } from "@/hooks/useLanguage";

const FALLBACK_QUOTES = [
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "Knowledge is the key to every future.", author: "UniCoreLibrary" },
  { text: "Not all those who wander the stacks are lost.", author: "J.R.R. Tolkien" },
];

const HeroBanner = ({ onSearch, searchValue, onSearchChange, placeholder }) => {
  const { t } = useLanguage();
  const [internalValue, setInternalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const inputRef = useRef(null);

  // Safely extract quotes from locale
  const quotesFromLocale = t["elibraryHero.quotes"] ?? t.elibraryHero?.quotes;
  const QUOTES = Array.isArray(quotesFromLocale) && quotesFromLocale.length > 0
    ? quotesFromLocale
    : FALLBACK_QUOTES;

  const value = searchValue !== undefined ? searchValue : internalValue;
  const setValue = onSearchChange ?? setInternalValue;

  useEffect(() => {
    const iv = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 260);
    }, 5000);
    return () => clearInterval(iv);
  }, [QUOTES.length]);

  useEffect(() => {
    setQuoteIndex((i) => (QUOTES.length ? i % QUOTES.length : 0));
  }, [QUOTES.length]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onSearch) onSearch(value);
  };

  const quote = QUOTES[quoteIndex] ?? QUOTES[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <HeroStyles />

      {/* Drifting motes background effect */}
      <div className="hero-motes pointer-events-none absolute inset-0 z-0" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`mote mote-${i % 7}`} />
        ))}
      </div>

      {/* Radial soft glow */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-30" 
        style={{ background: "radial-gradient(ellipse at 15% 0%, rgba(44,45,224,0.12) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-8 p-5 sm:p-8 md:p-10 lg:p-12 max-w-7xl mx-auto w-full min-h-[380px] lg:min-h-[440px]">
        
        {/* LEFT: Identity, search, hint */}
        <div className="flex-1 min-w-0 w-full flex flex-col items-center md:items-start text-center md:text-left gap-3 sm:gap-4">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C2DE0]/10 border border-[#2C2DE0]/20 text-[#2C2DE0] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{t["elibraryHero.eyebrow"] ?? t.elibraryHero?.eyebrow ?? "UniCoreLibrary"}</span>
          </div>

          {quote && (
            <p className={`text-xs sm:text-sm italic text-gray-500 dark:text-gray-400 min-h-[20px] transition-all duration-300 ${quoteVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
              "{quote.text}"<span className="not-italic font-bold text-[#2C2DE0] dark:text-blue-400"> — {quote.author}</span>
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
            {t["elibraryHero.title"] ?? t.elibraryHero?.title ?? "Welcome to your digital library"}
          </h1>

          {/* Search Form (Native keyboard trigger support) */}
          <form 
            onSubmit={handleSubmit}
            className={`hero-search-shell relative flex items-center gap-2 w-full max-w-xl p-1.5 sm:p-2 pl-4 rounded-2xl bg-white dark:bg-gray-800 border transition-all duration-200 shadow-sm ${
              focused 
                ? "border-[#2C2DE0] ring-4 ring-[#2C2DE0]/15 dark:ring-[#2C2DE0]/30 shadow-md" 
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="hero-search-ring" aria-hidden />
            <Search size={18} className="text-[#2C2DE0] shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={
                placeholder ??
                (t["elibraryHero.searchPlaceholder"] ?? t.elibraryHero?.searchPlaceholder ?? "Search books, authors, ISBN...")
              }
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 py-2"
            />

            <button
              type="submit"
              className="bg-[#2C2DE0] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0 cursor-pointer group"
              aria-label={t["elibraryHero.searchBtn"] ?? t.elibraryHero?.searchBtn ?? "Search"}
            >
              <span className="hidden xs:inline font-medium tracking-wide">
                {t["elibraryHero.searchBtn"] ?? t.elibraryHero?.searchBtn ?? "Search"}
              </span>
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </form>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t["elibraryHero.hint"] ?? t.elibraryHero?.hint ?? "Find books instantly in your library"}
          </p>
        </div>

        {/* RIGHT: Owl Mascot */}
        <div className="shrink-0 flex justify-center items-center w-28 xs:w-36 sm:w-48 md:w-56 lg:w-64">
          <OwlMascot size={220} />
        </div>

      </div>
    </div>
  );
};

const HeroStyles = () => (
  <style>{`
    .hero-search-ring {
      position: absolute;
      inset: -1.5px;
      border-radius: 17px;
      padding: 1.5px;
      background: conic-gradient(from var(--ang, 0deg), rgba(44,45,224,0) 0%, rgba(44,45,224,0.7) 15%, rgba(44,45,224,0) 30%);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: heroRingSpin 4s linear infinite;
      opacity: 0.6;
      pointer-events: none;
    }
    @keyframes heroRingSpin {
      to { --ang: 360deg; }
    }
    @property --ang {
      syntax: '<angle>';
      inherits: false;
      initial-value: 0deg;
    }

    .hero-motes .mote {
      position: absolute;
      bottom: -10px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #2C2DE0;
      opacity: 0;
      animation: moteRise 8s linear infinite;
    }
    .mote-0 { left: 8%;  animation-delay: 0s; }
    .mote-1 { left: 22%; animation-delay: 1.5s; }
    .mote-2 { left: 38%; animation-delay: 2.8s; }
    .mote-3 { left: 54%; animation-delay: 0.9s; }
    .mote-4 { left: 70%; animation-delay: 3.2s; }
    .mote-5 { left: 84%; animation-delay: 1.8s; }
    .mote-6 { left: 94%; animation-delay: 4.1s; }

    @keyframes moteRise {
      0%   { opacity: 0; transform: translateY(0) scale(0.6); }
      15%  { opacity: 0.5; }
      85%  { opacity: 0.2; }
      100% { opacity: 0; transform: translateY(-180px) scale(1.1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-search-ring { animation: none; opacity: 0.2; }
      .hero-motes .mote { animation: none; }
    }
  `}</style>
);

export default HeroBanner;