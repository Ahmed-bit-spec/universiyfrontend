import { useState } from "react";
import {
  Armchair, QrCode, CalendarCheck, GraduationCap, BookOpen, Users,
  CheckCircle2, ArrowRight, ChevronDown,
} from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

// Icons + fallback copy live here; the actual display text always comes
// from the translation files (t.dashboard.tutorial…) so the component
// works for both en.js and so.js without any text hardcoded per-language.
// If a key is missing from the translation file yet, the English fallback
// below is shown so nothing ever renders blank.
const STEP_ICONS = [Armchair, QrCode, CalendarCheck, GraduationCap, BookOpen, Users];

const STEP_FALLBACKS = [
  {
    title: "Reserve a seat",
    desc: "Open Seats in the sidebar and tap the seat you want. A window opens: first choose how long you need it (30 min, 1h, 1.5h, or 2h), then pick a time slot. Slots you can't tap are already taken or in the past — the library is open 7:00 AM to 5:00 PM.",
    tip: "Grayed-out time buttons just mean that slot isn't available anymore.",
  },
  {
    title: "Get your QR code & ID",
    desc: "Confirm your slot and we generate a QR code and a manual ID for that reservation right away.",
    tip: "You can only hold one active reservation at a time.",
  },
  {
    title: "Check in when you arrive",
    desc: "At the library, open My Reservations in the sidebar and show your QR code or ID to check into your seat.",
    tip: "Keep My Reservations open on your phone as you walk in.",
  },
  {
    title: "Take an exam",
    desc: "Get your exam token from your teacher first. Then open E-exam in the sidebar, enter the token, and start the exam.",
    tip: "Without a token from your teacher, the exam won't start.",
  },
  {
    title: "Read from the e-library",
    desc: "Open Library, search for the book you want, and tap Read. Pages are protected — no copying text and no photographing the screen. Stuck on something? Use the AI helper on the page and ask it to explain.",
    tip: "The AI helper only explains what's on the page you're reading.",
  },
  {
    title: "Post, chat, and join lectures",
    desc: "Open Community to see posts from other students, comment and like, message your chats, and join a lecture meeting when one is happening.",
    tip: "Meetings for a lecture show up right inside Community.",
  },
];

const StepCard = ({ step, index, isLast }) => {
  const [open, setOpen] = useState(index === 0);
  const Icon = STEP_ICONS[index];
    const { t } = useLanguage();
  const tut = t?.dashboard?.tutorial;

  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-[#2C2DE0] flex items-center justify-center shadow-sm shadow-[#2C2DE0] dark:shadow-none flex-shrink-0">
          <Icon size={18} className="text-white" strokeWidth={2} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-linear-to-b from-[#2C2DE0] dark:from-[#2C2DE0] to-transparent mt-2 min-h-[32px]" />
        )}
      </div>

      <div className="flex-1 pb-8">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-start justify-between gap-3 text-left group"
        >
          <div className="flex-1 min-w-0">
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C2DE0] block mb-1">
  {tut?.stepLabel || "Step"} {String(index + 1).padStart(2, "0")}
</span>
            <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
              {step.title}
            </h3>
          </div>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-gray-400 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {step.desc}
            </p>
            <div className="flex items-start gap-2.5 dark:bg-[#2C2DE0]/10  dark:border-[#2C2DE0]/20 rounded-xl px-3.5 py-3">
              <CheckCircle2 size={13} className="text-[#2C2DE0] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] leading-relaxed">
                {step.tip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TutorialSection = () => {
  const { t } = useLanguage();
  const tut = t?.dashboard?.tutorial;

  const steps = STEP_FALLBACKS.map((fallback, i) => ({
    title: tut?.steps?.[i]?.title || fallback.title,
    desc: tut?.steps?.[i]?.desc || fallback.desc,
    tip: tut?.steps?.[i]?.tip || fallback.tip,
  }));

  return (
    <section className="w-full mt-10 px-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="md:sticky md:top-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-full mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {tut?.eyebrow || "How it works"}
            </span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight whitespace-pre-line">
            {tut?.heading || "Everything you can do,\nstep by step"}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed max-w-sm">
            {tut?.intro || "Reserve a seat, sit an exam, read a book, or catch up with your class — here's exactly how each one works."}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { value: "< 1 min", label: tut?.stats?.[0] || "To reserve a seat" },
              { value: "40", label: tut?.stats?.[1] || "Study seats" },
              { value: "Free", label: tut?.stats?.[2] || "For students" },
            ].map((s) => (
              <div
                key={s.value}
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-3 py-3 text-center"
              >
                <p className="text-lg font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <a
            href="/seats"
            className="mt-8 inline-flex items-center gap-2 bg-[#2C2DE0] text-white text-sm font-bold px-5 py-3 rounded-xl
              shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA]
              active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            {tut?.cta || "Reserve your seat"}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl px-6 pt-7 pb-2 shadow-sm">
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const DashboardFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="max-w-6xl mx-auto mt-16 px-6 pb-8">
      <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Uniso Digital Library · {t.dashboard.footerRights}
        </p>
        <p className="text-xs text-gray-400">
          {t.dashboard.footerBuilt}
        </p>
      </div>
    </footer>
  );
};