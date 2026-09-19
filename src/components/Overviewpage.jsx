import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users, CalendarCheck, BookOpen, Activity, TrendingUp, Clock } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip } from "./Analyticscomponents";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";

const COLORS = { reservations: "#2C2DE0", checkIns: "#3b82f6", borrowing: "#f97316" };

const OverviewPage = () => {
    const { data, isLoading } = useAnalyticsOverview();
    const kpis = data?.kpis ?? {};
    const trends = data?.monthlyTrends ?? [];

    if (isLoading) {
        return (
            <PageTransition>
                <PageHeader title="Overview" subtitle="Library performance at a glance" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
                    ))}
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <PageHeader title="Overview" subtitle="Library performance at a glance" />

            {/* KPIs */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Users} label="Total Users" value={kpis.totalUsers} color="bg-blue-500" />
                <KpiCard icon={Users} label="Verified Students" value={kpis.verifiedStudents} color="bg-indigo-500" />
                <KpiCard icon={CalendarCheck} label="Reservations This Month" value={kpis.reservationsThisMonth} color="bg-[#2C2DE0]" trend={kpis.reservationGrowth >= 0 ? "up" : "down"} trendValue={kpis.reservationGrowth} />
                <KpiCard icon={Activity} label="Check-ins This Month" value={kpis.checkInsThisMonth} color="bg-teal-500" trend={kpis.checkInGrowth >= 0 ? "up" : "down"} trendValue={kpis.checkInGrowth} />
                <KpiCard icon={BookOpen} label="Books Borrowed" value={kpis.booksBorrowed} color="bg-orange-500" />
                <KpiCard icon={TrendingUp} label="No-Show Rate" value={`${kpis.noShowRate ?? 0}%`} color="bg-red-500" sub="lower is better" />
                <KpiCard icon={Activity} label="Seat Utilization" value={`${kpis.seatUtilization ?? 0}%`} color="bg-purple-500" />
                <KpiCard icon={Clock} label="Avg Daily Visitors" value={kpis.avgDailyVisitors} color="bg-amber-500" sub="last 30 days" />
            </div>

            {/* 12-month combined trend */}
            <Section title="12-Month Activity Trends" className="mb-5">
                <div className="mb-4 flex items-center gap-6">
                    {[
                        { key: "reservations", label: "Reservations", color: COLORS.reservations },
                        { key: "checkIns", label: "Check-ins", color: COLORS.checkIns },
                        { key: "borrowing", label: "Borrowing", color: COLORS.borrowing },
                    ].map(s => (
                        <div key={s.key} className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</span>
                        </div>
                    ))}
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="reservations" stroke={COLORS.reservations} strokeWidth={2} dot={false} name="Reservations" />
                        <Line type="monotone" dataKey="checkIns" stroke={COLORS.checkIns} strokeWidth={2} dot={false} name="Check-ins" />
                        <Line type="monotone" dataKey="borrowing" stroke={COLORS.borrowing} strokeWidth={2} dot={false} name="Borrowing" />
                    </LineChart>
                </ResponsiveContainer>
            </Section>

            {/* 3 bar charts per metric */}
            <div className="grid gap-5 lg:grid-cols-3">
                {[
                    { key: "reservations", label: "Reservations by Month", color: COLORS.reservations },
                    { key: "checkIns", label: "Check-ins by Month", color: COLORS.checkIns },
                    { key: "borrowing", label: "Borrowing by Month", color: COLORS.borrowing },
                ].map(m => (
                    <Section key={m.key} title={m.label}>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={trends} barSize={14}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                                <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 9 }} stroke="#9ca3af" />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey={m.key} fill={m.color} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>
                ))}
            </div>
        </PageTransition>
    );
};

export default OverviewPage;