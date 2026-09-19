import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, Activity, Armchair } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip, Heatmap } from "./Analyticscomponents";
import { useAnalyticsLibraryUsage } from "@/hooks/useAnalytics";

const LibraryUsagePage = () => {
    const { data } = useAnalyticsLibraryUsage();

    const totalVisitors = (data?.dailyVisitors ?? []).reduce((s, d) => s + d.visitors, 0);
    const peakDay = (data?.dailyVisitors ?? []).reduce((m, d) => d.visitors > (m?.visitors ?? 0) ? d : m, null);

    return (
        <PageTransition>
            <PageHeader title="Library Usage" subtitle="Foot traffic, seat utilization and peak time patterns" />

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <KpiCard icon={Users} label="Visitors (last 30d)" value={totalVisitors} color="bg-teal-500" />
                <KpiCard icon={Activity} label="Peak Day" value={peakDay?.date ?? "—"} color="bg-purple-500" sub={peakDay ? `${peakDay.visitors} visitors` : ""} />
                <KpiCard icon={Armchair} label="Total Seats" value={data?.totalSeats} color="bg-blue-500" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Daily visitors */}
                <Section title="Daily Unique Visitors (last 30 days)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data?.dailyVisitors ?? []}>
                            <defs>
                                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#9ca3af"
                                tickFormatter={v => v.slice(5)} interval={3} />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="visitors" stroke="#14b8a6" strokeWidth={2}
                                fill="url(#visitorGrad)" name="Unique visitors" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Section>

                {/* Heatmap */}
                <Section title="Peak Hours Heatmap (last 30 days)" className="lg:col-span-2">
                    <Heatmap data={data?.heatmap ?? []} />
                </Section>

                {/* Morning vs afternoon */}
                <Section title="Morning vs Afternoon (by day)">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data?.morningVsAfternoon ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="morning" fill="#2C2DE0" radius={[4, 4, 0, 0]} name="Morning (7–12)" stackId="a" />
                            <Bar dataKey="afternoon" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Afternoon (12–18)" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex gap-4">
                        <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#2C2DE0]" /><span className="text-[10px] text-gray-500">Morning (7–12)</span></div>
                        <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-500">Afternoon (12–18)</span></div>
                    </div>
                </Section>

                {/* Zone utilization */}
                <Section title="Zone Utilization (seat-hours)">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data?.zoneUtilization ?? []} layout="vertical" barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                            <YAxis dataKey="zone" type="category" tick={{ fontSize: 10 }} stroke="#9ca3af" width={70} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="hours" fill="#a855f7" radius={[0, 6, 6, 0]} name="Seat-hours" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>
        </PageTransition>
    );
};

export default LibraryUsagePage;