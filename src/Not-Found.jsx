import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home, HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/FrontDoorSystem/components/LandingHeader";
import LandingFooter from "@/FrontDoorSystem/components/LandingFooter";
import StudentFooter from "@/student/components/StudentFooter";
import { pageBg } from "@/shared/constants/surfaces";
import DashboardHeader from "./student/components/DashboardComponents/DashboardHeader";

const NotFound = () => {
  const { t, language } = useLanguage();
  const { user, loading } = useAuth();

  const isLoggedIn = Boolean(user);
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";

  const homePath = !user
    ? "/"
    : isAdmin
      ? "/admin/dashboard"
      : "/dashboard";

  const errorTitle = t.notFound?.title || (language === "so" ? "Bogga Lama Helin" : "Page Not Found");
  const errorSubtitle = t.notFound?.subtitle || "404";
  const errorDescription = t.notFound?.description || (language === "so"
    ? "Waan ka xunnahay, bogga aad raadinayso ma jiro ama waa la beddelay."
    : "Sorry, the page you are looking for does not exist or has been moved.");
  const backHomeBtn = t.notFound?.backHome ?? "Back to Dashboard";
  const backHomeGuest = t.notFound?.backHomeGuest ?? "Back to Home";
  const goBackLabel = language === "so" ? "Noqo" : "Go Back";

  if (loading) return null;

  // ── Shared 404 content ───────────────────────────────────────────────────
  const content = (
    <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 py-16 text-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl  dark:bg-[#2C2DE0]/10 border border-[#2C2DE0] dark:border-[#2C2DE0]/30 flex items-center justify-center text-[#2C2DE0] mx-auto shadow-sm"
        >
          <HelpCircle size={44} strokeWidth={1.5} />
        </motion.div>
        <div className="absolute inset-0 bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/5 blur-xl -z-10 rounded-full" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-8xl md:text-9xl font-black text-gray-900 dark:text-white tracking-tighter"
      >
        {errorSubtitle}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="inline-block mt-3 px-4 py-1 bg-[#2C2DE0]/10 text-[#2C2DE0] border border-[#2C2DE0]/20 rounded-full text-xs font-bold uppercase tracking-widest"
      >
        {errorTitle}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-500 dark:text-gray-400 mt-6 max-w-md mx-auto text-sm md:text-base leading-relaxed"
      >
        {errorDescription}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto"
      >
        <Link
          to={homePath}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none text-sm"
        >
          <Home size={16} />
          {isLoggedIn ? backHomeBtn : backHomeGuest}
        </Link>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold  dark:text-gray-400 hover:text-white dark:hover:text-[#2C2DE0] transition-colors px-6 py-3.5 rounded-xl   text-white
           bg-[#2C2DE0] 
                              shadow-[0_4px_0_#2C2DE0]
                              hover:translate-y-0.5 hover:shadow-[0_2px_0_#2C2DE0]
                              active:translate-y-1 active:shadow-none
                               duration-150"

        >
          <ArrowLeft size={16} />
          {goBackLabel}
        </button>
      </motion.div>
    </main>
  );

  // ── Admin: clean standalone page, no sidebar/header ──────────────────────
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        {content}
      </div>
    );
  }

  // ── Student ───────────────────────────────────────────────────────────────
  if (isStudent) {
    return (
      <div className={`min-h-screen flex flex-col ${pageBg}`}>
        <DashboardHeader />
        {content}
        <StudentFooter />
      </div>
    );
  }

  // ── Guest ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <LandingHeader />
      {content}
      <LandingFooter />
    </div>
  );
};

export default NotFound;