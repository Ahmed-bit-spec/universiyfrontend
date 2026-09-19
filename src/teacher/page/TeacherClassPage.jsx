import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/api/client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  RefreshCw,
  Search,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeacherLanguage } from "../hooks/useLanguages";



const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800", className)} />
);

// Accent color by index (cycles)
const ACCENTS = [
  { bg: "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10", text: "text-[#fff] dark:text-[#2C2DE0]", dot: "bg-[#2C2DE0]" },
  { bg: "bg-gray-50 dark:bg-zinc-800/50",   text: "text-gray-900 dark:text-white",   dot: "bg-gray-500"  },
  { bg: "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10", text: "text-[#fff] dark:text-[#2C2DE0]", dot: "bg-[#2C2DE0]" },
  { bg: "bg-gray-50 dark:bg-zinc-800/50",   text: "text-gray-900 dark:text-white",   dot: "bg-gray-500"  },
];

const TeacherClassesPage = () => {
  const { t } = useTeacherLanguage();
  const p = t?.classes || {};
  const c = t?.common || {};

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: json } = await api.get("/teacher/classes");
      setClasses(json.data.classes);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.classCode.toLowerCase().includes(q) ||
      c.course.title.toLowerCase().includes(q) ||
      c.course.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2C2DE0] dark:text-[#2C2DE0] mb-1">
            {p.teaching || "Teaching"}
          </p>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{p.myClasses || "My Classes"}</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {loading ? (c.loading || "Loading…") : (p.classesAssigned ? p.classesAssigned(classes.length) : `${classes.length} class${classes.length !== 1 ? "es" : ""} assigned to you`)}
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={p.searchPlaceholder || "Search classes…"}
            className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30"
          />
        </div>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div {...fadeUp(0.05)} className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchClasses} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
            <RefreshCw size={12} /> {p.retry || "Retry"}
          </button>
        </motion.div>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-44" />)}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div {...fadeUp(0.1)} className="py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
            <BookOpen size={24} className="text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {search ? (p.noMatch || "No classes match your search.") : (p.noClasses || "No classes assigned yet.")}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] font-semibold hover:underline">
              {p.clearSearch || "Clear search"}
            </button>
          )}
        </motion.div>
      )}

      {/* ── Class cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cls, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div key={cls.id} {...fadeUp(0.06 + i * 0.03)}>
                <Link
                  to={`/teacher/classes/${cls.id}`}
                  className="group block rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent.bg)}>
                      <BookOpen size={18} className={`${accent.text}`} />
                    </div>
                    <div className="flex items-center gap-1 mt-1f">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{cls.studentCount}</span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-0.5">{p.students || "students"}</span>
                    </div>
                  </div>

                  {/* Course name + code */}
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-[#2C2DE0] dark:group-hover:text-[#2C2DE0] transition-colors line-clamp-2">
                      {cls.course.title}
                    </h3>
                    <p className={cn("text-[11px] font-bold mt-0.5", accent.text)}>
                      {cls.classCode}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
                      <GraduationCap size={11} />
                      <span>{cls.course.department}</span>
                      <span className="text-gray-300 dark:text-zinc-600">·</span>
                      <span>{cls.course.credits} cr</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
                      <Calendar size={11} />
                      <span>Semester {cls.semester} · {cls.year}</span>
                    </div>
                    {cls.schedule?.day && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
                        <Clock size={11} />
                        <span>{cls.schedule.day} {cls.schedule.time}</span>
                      </div>
                    )}
                  </div>

                  {/* Description excerpt */}
                  {cls.course.description && (
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 line-clamp-2 mb-4">
                      {cls.course.description}
                    </p>
                  )}

                  {/* Footer CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex -space-x-1.5">
                      {/* Student count bubbles */}
                      {Array.from({ length: Math.min(cls.studentCount, 4) }).map((_, j) => (
                        <div
                          key={j}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center"
                        >
                          <span className="text-[8px] font-bold text-gray-500 dark:text-zinc-400">
                            {String.fromCharCode(65 + j)}
                          </span>
                        </div>
                      ))}
                      {cls.studentCount > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gray-500">+{cls.studentCount - 4}</span>
                        </div>
                      )}
                    </div>
                    <span className={cn("text-[11px] font-bold flex items-center gap-0.5 group-hover:gap-1 transition-all", accent.text)}>
                      {p.viewClass || "View class"} <ChevronRight size={11} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherClassesPage;