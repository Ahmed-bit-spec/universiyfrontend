// ModulesPreview.jsx
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, FileText, Brain, BarChart2, ArrowRight } from "lucide-react";

const modules = [
  {
    icon: GraduationCap,
    title: "Academic System",
    desc: "E-Learning, course delivery, curriculum management, and digital classroom tools.",
    tag: "Core",
  },
  {
    icon: BookOpen,
    title: "Library System",
    desc: "Digital catalog, borrowing, reservations, and research resource management.",
    tag: "Core",
  },
  {
    icon: FileText,
    title: "Examination System",
    desc: "Secure online exams with auto-grading, proctoring, and instant results.",
    tag: "Core",
  },
  {
    icon: Brain,
    title: "AI System",
    desc: "Smart search, AI study assistant, and intelligent recommendations across modules.",
    tag: "AI",
  },
  {
    icon: BarChart2,
    title: "Analytics Dashboard",
    desc: "Real-time insights on performance, attendance, library usage, and system health.",
    tag: "Analytics",
  },
];

const tagColors = {
  Core: "bg-white dark:bg-gray-900/8 text-white/50",
  AI: "bg-[#63DF4E]/12 text-[#63DF4E]",
  Analytics: "bg-blue-400/12 text-blue-300",
};

const ModulesPreview = () => (
  <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 sm:py-24">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#63DF4E]">
          System Modules
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white leading-tight">
          Integrated modules,{" "}
          <span className="text-white/50">one system</span>
        </h2>
      </div>
      <a
        href="#"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#63DF4E] hover:text-[#7aee69] transition-colors shrink-0 group"
      >
        View all modules
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {modules.map((mod, i) => {
        const Icon = mod.icon;
        return (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent p-6 hover:border-[#63DF4E]/30 hover:from-[#63DF4E]/5 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#053047] border border-white/10 flex items-center justify-center group-hover:border-[#63DF4E]/30 transition-colors">
                <Icon size={22} className="text-[#63DF4E]" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagColors[mod.tag]}`}>
                {mod.tag}
              </span>
            </div>
            <h3 className="font-black text-white text-[15px] mb-2">{mod.title}</h3>
            <p className="text-sm text-white/45 leading-relaxed">{mod.desc}</p>

            <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#63DF4E] opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <ArrowRight size={12} />
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default ModulesPreview;