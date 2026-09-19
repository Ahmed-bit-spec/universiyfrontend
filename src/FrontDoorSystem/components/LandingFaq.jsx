// ═══════════════════════════════════════════════════════════════════
// FAQ COMPONENT

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FaqItem = ({ faq, isOpen, onToggle }) => (
  <div
    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isOpen
        ? "border-[#2C2DE0] bg-[#2C2DE0]/5"
        : "border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/2 hover:border-black/20 dark:hover:border-white/20"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
    >
      <span className={`text-sm font-semibold ${isOpen ? "text-[#2C2DE0]" : "text-black dark:text-white"}`}>
        {faq.question}
      </span>
      <ChevronDown
        size={16}
        className={`shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-[#2C2DE0]" : "text-black/30 dark:text-white/30"
        }`}
      />
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-4 text-sm text-black/55 dark:text-white/55 leading-relaxed">{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = ({ t }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const faqs = t?.landing?.faqs || [
    { question: "What is the main advantage of using this system?", answer: "The biggest advantage is having all your academic needs in one place—from reserving library seats and reading books to taking exams, saving you time and effort." },
    { question: "How does the system make using the library easier?", answer: "It allows you to reserve a physical seat in the library from home. You can also read e-books online 24/7 without needing to visit the campus." },
    { question: "How does the AI assistant work?", answer: "The AI assistant is exclusively designed to summarize the specific page you are currently reading, helping you grasp the core concepts without leaving the book." },
    { question: "Are online exams secure?", answer: "Yes. Exams run in a locked browser with randomized questions, time limits, and automated proctoring to prevent cheating." },
    { question: "Who can use UNICORE?", answer: "UNICORE is tailored for University of Somalia students, lecturers, librarians, and administrators. Each role gets a personalized dashboard." },
    { question: "Is it free for students?", answer: "Yes. The platform is completely free for all officially enrolled University of Somalia students." },
    { question: "Can I use it on my phone?", answer: "Absolutely. UNICORE is fully responsive and works beautifully on any smartphone, tablet, or laptop." },
    { question: "How do I get support?", answer: "Use the Contact page to send us a message, and we will respond within 24 hours. For urgent issues, visit the library desk in person." },
  ];

  const half = Math.ceil(faqs.length / 2);

  return (
    <section id="faq" className="w-full bg-white dark:bg-black scroll-mt-20" aria-label="FAQ">
      <div className="w-full max-w-350 mx-auto px-6 lg:px-10 py-16 sm:py-24 lg:py-28">
        <div className="mb-8 sm:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2C2DE0]">
            {t?.landing?.sectionFaq || "FAQ"}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-black dark:text-white leading-tight">
            {t?.landing?.commonQuestions || "Common questions"}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            {faqs.slice(0, half).map((faq, i) => (
              <FaqItem key={i} faq={faq} isOpen={openIndex === i} onToggle={() => toggle(i)} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {faqs.slice(half).map((faq, i) => (
              <FaqItem key={i + half} faq={faq} isOpen={openIndex === i + half} onToggle={() => toggle(i + half)} />
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-2xl overflow-hidden bg-[#2C2DE0]">
          <div className="px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-3">
              {t?.landing?.faqCtaEyebrow || "University of Somalia"}
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white max-w-lg mx-auto leading-tight">
              {t?.landing?.faqCtaTitle || "Ready to access your library?"}
            </h3>
            <p className="text-white/80 text-sm mt-3 mb-8 max-w-sm mx-auto leading-relaxed">
              {t?.landing?.faqCtaDescription || "Create a free account and start reserving seats and reading books today."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-black text-white text-sm font-bold hover:opacity-80 transition-opacity"
              >
                {t?.landing?.getStarted || "Get Started Free"}
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                {t?.navbar?.signIn || "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;