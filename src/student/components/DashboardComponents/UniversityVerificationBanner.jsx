// UniversityVerificationBanner.jsx
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUniversityVerification } from "@/hooks/useUniversityVerification";
import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "universityVerificationBannerDismissed";

const UniversityVerificationBanner = () => {
  const { t } = useLanguage();
  const { needsVerification, isUniversityVerified, universityId } = useUniversityVerification();

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "true"
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  }, []);

  // If verification status resets (e.g. ID expired), let the banner reappear.
  useEffect(() => {
    if (!needsVerification && !isUniversityVerified && dismissed) {
      localStorage.removeItem(DISMISS_KEY);
      setDismissed(false);
    }
  }, [needsVerification, isUniversityVerified, dismissed]);

  if (dismissed) return null;

  if (needsVerification) {
    return (
      <div className="max-w-6xl mx-auto px-6 mt-6 banner-enter">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 dark:bg-gray-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-5 py-4 overflow-hidden shadow-sm">

          <div className="flex items-start gap-3 flex-1 pl-2">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-50 dark:ring-gray-900 dot-ping" />
            </div>

            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {t.banner?.warningTitle ?? "Verification required"}
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-0.5 leading-relaxed">
                {t.banner?.warningBody ?? "Verify your university identity to unlock seat reservations and the full library."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 sm:pl-0 shrink-0">
            <Link
              to="/verify-university-id"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl   bg-[#2C2DE0]
              text-white
              text-sm
              font-bold
              shadow-[0_4px_0_#1E1FAA]
              hover:translate-y-0.5
              hover:shadow-[0_2px_0_#1E1FAA]
              active:translate-y-1
              active:shadow-none
              transition-all
              duration-150 group"
            >
              {t.banner?.verifyNow ?? "Verify now"}
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={handleDismiss}
              className=" text-white text-sm font-bold  active:translate-y-1 active:shadow-none transition-all duration-150 group"
              aria-label={t.common?.close ?? "Close"}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes bannerEnter { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes barPulse    { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes dotPing     { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
          .banner-enter { animation: bannerEnter 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
          .bar-pulse    { animation: barPulse 2s ease-in-out infinite; }
          .dot-ping     { animation: dotPing 1.5s ease-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .banner-enter, .bar-pulse, .dot-ping { animation: none; }
          }
        `}</style>
      </div>
    );
  }

  if (isUniversityVerified && universityId) {
    return (
      <div className="max-w-6xl mx-auto px-6 mt-6 banner-enter">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 w-fit shadow-sm">
          <ShieldCheck size={15} className="text-[#2C2DE0] shrink-0" />
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {t.banner?.verifiedBadge ?? "Verified student"}
          </span>
          <span className="text-xs text-gray-300 dark:text-gray-700 dark:text-gray-300">·</span>
          <span className="text-xs font-mono font-bold tracking-wider bg-[#2C2DE0] text-white px-3 py-1.5 rounded-lg shadow-[0_3px_0_#2D6A00]">
            {universityId}
          </span>
        </div>

        <style>{`
          @keyframes bannerEnter { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .banner-enter { animation: bannerEnter 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
          @media (prefers-reduced-motion: reduce) { .banner-enter { animation: none; } }
        `}</style>
      </div>
    );
  }

  return null;
};

export default UniversityVerificationBanner;