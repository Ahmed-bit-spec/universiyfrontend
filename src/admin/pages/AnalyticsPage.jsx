/**
 * AnalyticsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads from GET /api/admin/analytics
 * Response shape (via sendSuccess → { success, data: { … } }):
 *   totalUsers, totalReservations, activeToday, peakHour,
 *   reservationsOverTime [{ date, count }],
 *   zoneBreakdown        [{ name, value }],
 *   topSeats             [{ seatNumber, count }],
 *   topStudents          [{ fullName, email, studentId, count }],
 *   heatmap              [{ values: number[10] }] × 7 rows,
 *   morningVsAfternoon   [{ label, morning, afternoon }]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Users, CalendarCheck, Activity, TrendingUp,
  Armchair, BookOpen, AlertTriangle, Loader2,
} from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader     from "@/admin/components/PageHeader";
import { useLanguage }         from "@/hooks/useLanguage";
import { fetchAdminAnalytics } from "@/api/admin";

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN       = "#2C2DE0";
const BLUE        = "#3b82f6";
const ORANGE      = "#f97316";
const VIOLET      = "#a855f7";
const GRAY        = "#9ca3af";
const PIE_COLORS  = [GREEN, BLUE, ORANGE, GRAY, VIOLET, "#ec4899"];

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200/70 bg-white/60 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
    <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value ?? "—"}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-200/70 bg-white/60 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] ${className}`}>
    <p className="mb-4 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {title}
    </p>
    {children}
  </div>
);

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-gray-900">
      {label && (
        <p className="mb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">{label}</p>
      )}
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-black" style={{ color: p.color }}>
          {p.name ?? p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Heatmap cell ─────────────────────────────────────────────────────────────
const HeatmapCell = ({ value, max }) => {
  const intensity = max > 0 ? value / max : 0;
  const bg =
    intensity === 0   ? "bg-gray-100 dark:bg-white/5"
    : intensity < 0.33 ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/40"
    : intensity < 0.66 ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/60"
    :                    "bg-[#2C2DE0] dark:bg-[#2C2DE0]";

  return (
    <div
      title={value ? `${value} reservations` : "0"}
      className={`flex h-8 items-center justify-center rounded-lg text-[9px] font-bold
        text-gray-700 dark:text-gray-300 transition-colors ${bg}`}
    >
      {value || ""}
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5 ${className}`} />
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const { t }  = useLanguage();
  const ap     = t.adminPanel;
  const p      = ap.pages.analytics;

  const { data: raw, isLoading, isError, error } = useQuery({
    queryKey:       ["admin-analytics"],
    queryFn:        async () => {
      const res = await fetchAdminAnalytics();
      const body = res.data?.data ?? res.data ?? {};
      return body.analytics ?? body;
    },
    refetchInterval: 60_000,
    staleTime:       30_000,
  });

  const d = raw ?? {};

  // Derived values
  const heatmapMax = Math.max(
    1,
    ...(d.heatmap ?? []).flatMap((row) => row.values ?? [])
  );

  const HOURS_LABELS = ["7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM"];
  const DAYS_LABELS  = [p.mon, p.tue, p.wed, p.thu, p.fri, p.sat, p.sun];

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title={p.title} subtitle={p.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </PageTransition>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <PageTransition>
        <PageHeader title={p.title} subtitle={p.subtitle} />
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6
          dark:border-red-900/30 dark:bg-red-900/20">
          <AlertTriangle size={20} className="shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              Failed to load analytics
            </p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
              {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <PageTransition>
      <PageHeader title={p.title} subtitle={p.subtitle} />

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label={p.kpiTotalUsers}
          value={d.totalUsers ?? 0}
          color="bg-[#2C2DE0]"
        />
        <KpiCard
          icon={CalendarCheck}
          label={p.kpiTotalReservations}
          value={d.totalReservations ?? 0}
          color="bg-blue-500"
        />
        <KpiCard
          icon={Activity}
          label={p.kpiActiveToday}
          value={d.activeToday ?? 0}
          color="bg-yellow-500"
        />
        <KpiCard
          icon={TrendingUp}
          label={p.kpiPeakHour}
          value={d.peakHour}
          color="bg-violet-500"
        />
      </div>

      {/* ── Extended e-library KPIs ─────────────────────────────────────── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard icon={BookOpen} label="Books" value={d.totalBooks ?? 0} color="bg-emerald-600" />
        <KpiCard icon={BookOpen} label="Active Borrows" value={d.activeBorrows ?? 0} color="bg-teal-600" />
        <KpiCard icon={AlertTriangle} label="Overdue Borrows" value={d.overdueBorrows ?? 0} color="bg-red-500" />
        <KpiCard icon={Activity} label="Check-ins Today" value={d.checkInsToday ?? 0} color="bg-[#2C2DE0]" />
        <KpiCard icon={Users} label="Total Visits" value={d.totalCheckIns ?? 0} color="bg-indigo-500" />
        <KpiCard icon={Armchair} label="Exams" value={d.totalExams ?? 0} color="bg-orange-500" />
        <KpiCard icon={Users} label="Meetings" value={d.totalMeetings ?? 0} color="bg-pink-500" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* ── Reservations over time ───────────────────────────────────── */}
        <Section title={p.reservationsOverTime}>
          {(d.reservationsOverTime ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={d.reservationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke={GRAY}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke={GRAY}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Reservations"
                  stroke={GREEN}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* ── Zone breakdown ───────────────────────────────────────────── */}
        <Section title={p.zoneBreakdown}>
          {(d.zoneBreakdown ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={190}>
                <PieChart>
                  <Pie
                    data={d.zoneBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={72}
                    innerRadius={42}
                    paddingAngle={3}
                  >
                    {d.zoneBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {d.zoneBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-white ml-auto pl-4">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── Most used seats ──────────────────────────────────────────── */}
        <Section title={p.mostUsedSeats}>
          {(d.topSeats ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={d.topSeats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke={GRAY} allowDecimals={false} />
                <YAxis
                  dataKey="seatNumber"
                  type="category"
                  tick={{ fontSize: 10 }}
                  stroke={GRAY}
                  width={54}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Reservations" fill={GREEN} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* ── Most active students ─────────────────────────────────────── */}
        <Section title={p.topStudents}>
          {(d.topStudents ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2.5">
              {(d.topStudents ?? []).slice(0, 7).map((s, i) => {
                const topCount = d.topStudents?.[0]?.count || 1;
                return (
                  <div key={s._id ?? i} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full
                      bg-[#2C2DE0]/10 text-[10px] font-black text-[#2C2DE0] dark:text-[#2C2DE0]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {s.fullName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {s.studentId || s.email}
                      </p>
                    </div>
                    <div className="w-20 shrink-0">
                      <div className="mb-1 flex justify-end">
                        <span className="text-[10px] font-black text-[#2C2DE0] dark:text-[#2C2DE0]">
                          {s.count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#2C2DE0] transition-all"
                          style={{ width: `${Math.min(100, (s.count / topCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Best visitors (library check-ins) ────────────────────────── */}
        <Section title="Most frequent library visitors">
          {(d.topVisitors ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2.5">
              {(d.topVisitors ?? []).slice(0, 7).map((s, i) => (
                <div key={s._id ?? i} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-black text-indigo-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{s.fullName}</p>
                    <p className="text-[10px] text-gray-400">{s.studentId || s.email}</p>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600">{s.count} visits</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Top borrowers ────────────────────────────────────────────── */}
        <Section title="Top book borrowers">
          {(d.topBorrowers ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2.5">
              {(d.topBorrowers ?? []).slice(0, 7).map((s, i) => (
                <div key={s._id ?? i} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{s.fullName}</p>
                    <p className="text-[10px] text-gray-400">{s.studentId || s.email}</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600">{s.count} borrows</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Peak hours heatmap ───────────────────────────────────────── */}
        <Section title={p.peakHoursHeatmap} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {/* Hour header */}
              <div
                className="mb-1 grid gap-1"
                style={{ gridTemplateColumns: `64px repeat(${HOURS_LABELS.length}, 1fr)` }}
              >
                <div />
                {HOURS_LABELS.map((h) => (
                  <div key={h} className="text-center text-[9px] font-semibold text-gray-400">
                    {h}
                  </div>
                ))}
              </div>
              {/* Day rows */}
              {DAYS_LABELS.map((day, di) => (
                <div
                  key={day}
                  className="mb-1 grid gap-1"
                  style={{ gridTemplateColumns: `64px repeat(${HOURS_LABELS.length}, 1fr)` }}
                >
                  <div className="flex items-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                  {HOURS_LABELS.map((_, hi) => (
                    <HeatmapCell
                      key={hi}
                      value={d.heatmap?.[di]?.values?.[hi] ?? 0}
                      max={heatmapMax}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[10px] text-gray-400">{p.low}</span>
            <div className="flex gap-1">
              {[
                "bg-gray-100 dark:bg-white/5",
                "bg-[#2C2DE0]",
                "bg-[#2C2DE0]",
                "bg-[#2C2DE0]",
              ].map((c, i) => (
                <div key={i} className={`h-3 w-7 rounded ${c}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">{p.high}</span>
          </div>
        </Section>

        {/* ── Morning vs afternoon ─────────────────────────────────────── */}
        <Section title={p.morningVsAfternoon} className="lg:col-span-2">
          {(d.morningVsAfternoon ?? []).length === 0 ? (
            <EmptyChart />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d.morningVsAfternoon} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke={GRAY} />
                  <YAxis tick={{ fontSize: 10 }} stroke={GRAY} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="morning"
                    name={p.morning}
                    fill={GREEN}
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="afternoon"
                    name={p.afternoon}
                    fill={BLUE}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#2C2DE0]" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{p.morning}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{p.afternoon}</span>
                </div>
              </div>
            </>
          )}
        </Section>

      </div>
    </PageTransition>
  );
};

// ─── Empty state for charts with no data yet ──────────────────────────────────
const EmptyChart = () => (
  <div className="flex h-40 items-center justify-center">
    <p className="text-xs text-gray-400 dark:text-gray-600">No data yet</p>
  </div>
);

export default AnalyticsPage;