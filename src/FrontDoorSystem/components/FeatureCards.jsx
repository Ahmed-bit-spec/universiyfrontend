import {
  ArrowRight, ChevronRight, ChevronDown,
  BookOpen, FileText, Bot, Users, LayoutDashboard, GraduationCap,
  Brain, Shield, UserPlus, CheckCircle2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const featureMeta = [
  { icon: BookOpen, span: 1 },
  { icon: FileText, span: 2 },
  { icon: Brain, span: 2 },
  { icon: GraduationCap, span: 1 },
  { icon: Users, span: 1 },
  { icon: Shield, span: 2 },
];

const Features = ({ t }) => {
  const items = [
    { title: t?.landing?.features?.[1]?.title || "E-Library & Academic Resources", desc: t?.landing?.features?.[1]?.desc || "Access thousands of textbooks, past exam papers, and research papers with powerful full-text search." },
    { title: t?.landing?.features?.[0]?.title || "Seat Reservation System", desc: t?.landing?.features?.[0]?.desc || "Reserve your library seat before you arrive. Choose any time slot and walk in guaranteed." },
    { title: t?.landing?.features?.[2]?.title || "AI-Powered Learning Assistant", desc: t?.landing?.features?.[2]?.desc || "Summarize any book instantly, get 24/7 study support, and ask questions across all your subjects." },
    { title: t?.landing?.features?.[4]?.title || "Online Examinations", desc: t?.landing?.features?.[4]?.desc || "Secure browser-locked exams with randomized question sets, automated grading, and instant results." },
    { title: t?.landing?.features?.[5]?.title || "Community & Collaboration", desc: t?.landing?.features?.[5]?.desc || "Connect with peers in course-specific forums, share study notes, and collaborate on group projects." },
    { title: t?.landing?.features?.[3]?.title || "Fair Access for Everyone", desc: t?.landing?.features?.[3]?.desc || "Role-based access and one reservation per student keeps everything fair for the community." },
  ];

  return (
    <section id="features" className="w-full bg-white dark:bg-black" aria-label="Features">
      <div className="w-full max-w-350 mx-auto px-6 lg:px-10 py-16 sm:py-24 lg:py-28">
        <div className="mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2C2DE0]">
            {t?.landing?.sectionFeatures || "What the system does"}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-black dark:text-white leading-tight">
            {t?.landing?.headingMain || "Everything your university needs,"}{" "}
            <span className="text-[#1E1FAA]" >
              {t?.landing?.headingSub || "in one platform"}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureMeta.map((f, i) => {
            const Icon = f.icon;
            const item = items[i];
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={`group relative rounded-2xl border border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2 hover:bg-[#2C2DE0]/5 hover:border-[#2C2DE0]/40 transition-all duration-300 p-5 sm:p-6 overflow-hidden ${
                  f.span === 2 ? "lg:col-span-2" : ""
                }`}
              >
                {/* Icon badge — static decorative element, not a button, so it only needs a fill color */}
                <div className="w-10 h-10 rounded-xl bg-[#2C2DE0] flex items-center justify-center mb-5">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-base font-black text-black dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">{item.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;