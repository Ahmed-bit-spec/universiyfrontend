// UniversityVerificationBanner.jsx
// Shows a warning banner if the user has not verified their university ID.
// Shows a small verified badge if they have.
// English only. Duolingo-style verify button.

import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUniversityVerification } from "@/hooks/useUniversityVerification";
import { useState, useEffect, useCallback } from "react";

const UniversityVerificationBanner = () => {
  const { t } = useLanguage();
  const { needsVerification, isUniversityVerified, universityId } =
    useUniversityVerification();

  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem("universityVerificationBannerDismissed") === "true"
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("universityVerificationBannerDismissed", "true");
  }, []);

  // Reset if status changes
  useEffect(() => {
    if (!needsVerification && !isUniversityVerified && dismissed) {
      localStorage.removeItem("universityVerificationBannerDismissed");
      setDismissed(false);
    }
  }, [needsVerification, isUniversityVerified, dismissed]);

  if (dismissed) return null;

  // ── Warning: needs verification ──────────────────────────────────────────
  if (needsVerification) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 banner-enter">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 bg-amber-50 dark:bg-gray-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-5 py-4 overflow-hidden shadow-sm">
          {/* Animated left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-amber-400 dark:bg-amber-500 bar-pulse" />

          <div className="flex items-start gap-3 flex-1 pl-2">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-50 dark:ring-gray-900 dot-ping" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Verification Required
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-0.5 leading-relaxed">
                Verify your university ID to unlock seat reservations, e-library borrowing, exams, and collaboration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 sm:pl-0 shrink-0">
            <Link
              to="/verify-university-id"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
                bg-[#2C2DE0]
                shadow-[0_4px_0_#1E1FAA]
                hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA]
                active:translate-y-1 active:shadow-none
                transition-all duration-150 group"
            >
              Verify Now
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes bannerEnter { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes barPulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes dotPing     { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
          .banner-enter { animation: bannerEnter 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
          .bar-pulse    { animation: barPulse 2s ease-in-out infinite; }
          .dot-ping     { animation: dotPing 1.5s ease-out infinite; }
        `}</style>
      </div>
    );
  }

  // ── Verified badge ─────────────────────────────────────────────────────────
  if (isUniversityVerified && universityId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 banner-enter">
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border border-[#2C2DE0] dark:border-[#2C2DE0]/20 w-fit shadow-sm">
          <ShieldCheck size={15} className="text-[#2C2DE0] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#2C2DE0] dark:text-[#2C2DE0]">
            Verified Student
          </span>
          <span className="text-xs text-[#2C2DE0]/60 dark:text-[#2C2DE0]/40">·</span>
          <span className="text-xs font-mono font-bold tracking-wider text-[#2C2DE0] dark:text-[#2C2DE0]">
            {universityId}
          </span>
        </div>
        <style>{`
          @keyframes bannerEnter { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          .banner-enter { animation: bannerEnter 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        `}</style>
      </div>
    );
  }

  return null;
};

export default UniversityVerificationBanner;