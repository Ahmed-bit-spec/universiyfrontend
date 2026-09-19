import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  RefreshCw,
  Search,
  GraduationCap,
  Mail,
  CheckCircle2,
  Circle,
  User,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";



const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse rounded-lg bg-gray-100 dark:bg-zinc-800", className)} />
);

const GENDER_COLOR = {
  Male: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Female: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Other: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
};

const STATUS_COLOR = {
  active: "bg-[#2C2DE0] text-white dark:bg-[#2C2DE0]/15 dark:text-[#2C2DE0]",
  inactive: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400",
  graduated: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const TeacherClassDetailPage = () => {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: json } = await api.get(`/teacher/classes/${classId}`);
      setData(json.data);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Failed to load class");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [classId]);

  const cls = data?.class;
  const students = data?.students ?? [];

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.fullName ?? "").toLowerCase().includes(q) ||
      (s.universityId ?? "").toLowerCase().includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      (s.department ?? "").toLowerCase().includes(q)
    );
  });

  // Gender breakdown
  const genderStats = students.reduce((acc, s) => {
    acc[s.gender] = (acc[s.gender] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 w-full">

      {/* ── Back nav ── */}
      <motion.div {...fadeUp(0)}>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={14} /> Back to Classes
        </Link>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div {...fadeUp(0.05)} className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchDetail} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
            <RefreshCw size={12} /> Retry
          </button>
        </motion.div>
      )}

      {/* ── Class info card ── */}
      <motion.div {...fadeUp(0.05)}>
        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : cls ? (
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 flex items-center justify-center shrink-0">
                <BookOpen size={24} className="text-[#2C2DE0] dark:text-[#2C2DE0]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2C2DE0] dark:text-[#2C2DE0] mb-1">
                  {cls.classCode}
                </p>
                <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{cls.course.title}</h1>
                {cls.course.description && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">{cls.course.description}</p>
                )}

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                    <GraduationCap size={13} />
                    <span>{cls.course.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                    <Hash size={13} />
                    <span>{cls.course.courseCode} · {cls.course.credits} credits</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                    <Calendar size={13} />
                    <span>Semester {cls.semester} · {cls.year}</span>
                  </div>
                  {cls.schedule?.day && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                      <Clock size={13} />
                      <span>{cls.schedule.day} at {cls.schedule.time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student count pill */}
              <div className="sm:text-right shrink-0">
                <div className="inline-flex items-center gap-2 bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 px-3.5 py-2 rounded-xl">
                  <Users size={14} className="text-[#2C2DE0] dark:text-[#2C2DE0]" />
                  <span className="text-sm font-black text-[#2C2DE0] dark:text-[#2C2DE0]">{cls.studentCount}</span>
                  <span className="text-xs text-[#2C2DE0]/70 dark:text-[#2C2DE0]/60">students</span>
                </div>
                {Object.keys(genderStats).length > 0 && (
                  <div className="flex gap-1.5 mt-2 sm:justify-end">
                    {Object.entries(genderStats).map(([g, count]) => (
                      <span key={g} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", GENDER_COLOR[g] ?? GENDER_COLOR.Other)}>
                        {g}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* ── Student roster ── */}
      <motion.div {...fadeUp(0.12)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2C2DE0] dark:text-[#2C2DE0] mb-0.5">
              Roster
            </p>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {loading ? "Loading students…" : `${students.length} enrolled student${students.length !== 1 ? "s" : ""}`}
            </h2>
          </div>

          {/* Search */}
          <div className="relative sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students…"
              className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30"
            />
          </div>
        </div>

        {/* Table / cards */}
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
            <Users size={26} className="text-gray-300 dark:text-zinc-600" />
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              {search ? "No students match your search." : "No students enrolled yet."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] font-semibold hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/60">
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Student</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">ID</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Department</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Semester</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Contact</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Status</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-5 py-3">Claimed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-b border-gray-50 dark:border-zinc-800/60 last:border-0 hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors",
                      )}
                    >
                      {/* Name + gender */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-black text-gray-600 dark:text-zinc-300">
                              {((s.fullName || "").split(" ").map(n => n[0] || "").join("").slice(0, 2) || "?").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{s.fullName || "Unknown student"}</p>
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", GENDER_COLOR[s.gender] ?? GENDER_COLOR.Other)}>
                              {s.gender}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-[11px] font-mono text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {s.universityId}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-zinc-300 max-w-[160px] truncate">{s.department}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-zinc-300 text-center">{s.semester}</td>
                      <td className="px-5 py-3.5">
                        {s.email ? (
                          <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400 hover:underline truncate max-w-[160px]">
                            <Mail size={10} />{s.email}
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", STATUS_COLOR[s.status] ?? STATUS_COLOR.inactive)}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.isClaimed ? (
                          <CheckCircle2 size={15} className="text-[#2C2DE0]" />
                        ) : (
                          <Circle size={15} className="text-gray-300 dark:text-zinc-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-black text-gray-600 dark:text-zinc-300">
                          {((s.fullName || "").split(" ").map(n => n[0] || "").join("").slice(0, 2) || "?").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.fullName || "Unknown student"}</p>
                        <code className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{s.universityId}</code>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0", STATUS_COLOR[s.status] ?? STATUS_COLOR.inactive)}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><GraduationCap size={10} />{s.department}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} />Sem {s.semester}</span>
                    <span className={cn("font-bold px-1.5 py-0.5 rounded-full", GENDER_COLOR[s.gender] ?? GENDER_COLOR.Other)}>{s.gender}</span>
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:underline">
                        <Mail size={10} />{s.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result count when searching */}
        {!loading && search && filtered.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3 text-center">
            Showing {filtered.length} of {students.length} students
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default TeacherClassDetailPage;