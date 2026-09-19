import { useState } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CalendarCheck, Clock, Armchair, TrendingDown } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip, PeriodSelector, RankList } from "./Analyticscomponents";
import { useAnalyticsReservations } from "@/hooks/useAnalytics";

const PIE_COLORS = ["#2C2DE0", "#3b82f6", "#f97316", "#a855f7", "#9ca3af"];

const ReservationsPage = () => {
    const [period, setPeriod] = useState("30d");
    const { data, isLoading } = useAnalyticsReservations(period);

    const att = data?.attendance ?? {};
    const topSeats = data?.topSeats ?? [];

    return (
        <PageTransition>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <PageHeader title="Reservations" subtitle="Seat booking trends, peak hours and attendance analysis" />
                <PeriodSelector value={period} onChange={setPeriod} />
            </div>

            {/* Attendance KPIs */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={CalendarCheck} label="Total Reservations" value={att.total} color="bg-blue-500" />
                <KpiCard icon={CalendarCheck} label="Attendance Rate" value={`${att.attendanceRate ?? 0}%`} color="bg-[#2C2DE0]" sub="attended / total" />
                <KpiCard icon={TrendingDown} label="No-Show Rate" value={`${att.noShowRate ?? 0}%`} color="bg-red-500" sub="lower is better" />
                <KpiCard icon={TrendingDown} label="Cancellation Rate" value={`${att.cancellationRate ?? 0}%`} color="bg-orange-500" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Reservation trend */}
                <Section title="Reservation Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data?.trend ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#9ca3af"
                                tickFormatter={v => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="count" stroke="#2C2DE0" strokeWidth={2} dot={false} name="Reservations" />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>

                {/* Peak hours */}
                <Section title="Peak Hours">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data?.peakHours ?? []} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="reservations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reservations" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Zone breakdown */}
                <Section title="Zone Breakdown">
                    <div className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie data={data?.zoneBreakdown ?? []} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                                    {(data?.zoneBreakdown ?? []).map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                            {(data?.zoneBreakdown ?? []).map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                                    <span className="ml-auto text-xs font-black text-gray-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Attendance analysis */}
                <Section title="Attendance Analysis">
                    <div className="space-y-3">
                        {[
                            { label: "Attended", value: att.attended, total: att.total, color: "bg-[#2C2DE0]" },
                            { label: "No-shows", value: att.noShow, total: att.total, color: "bg-red-400" },
                            { label: "Cancelled", value: att.cancelled, total: att.total, color: "bg-orange-400" },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <span className="font-black text-gray-900 dark:text-white">
                                        {item.value ?? 0}
                                        <span className="ml-1 font-normal text-gray-400">
                                            ({item.total > 0 ? Math.round(((item.value ?? 0) / item.total) * 100) : 0}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                    <div
                                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                        style={{ width: `${item.total > 0 ? Math.round(((item.value ?? 0) / item.total) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Top seats */}
                <Section title="Most Used Seats" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topSeats} layout="vertical" barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis dataKey="seatNumber" type="category" tick={{ fontSize: 10 }} stroke="#9ca3af" width={52} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" fill="#2C2DE0" radius={[0, 6, 6, 0]} name="Uses" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>
        </PageTransition>
    );
};

export default ReservationsPage;