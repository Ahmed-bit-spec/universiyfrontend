import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { Users, ShieldCheck, AlertTriangle } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip, RankList } from "./Analyticscomponents";
import { useAnalyticsStudents } from "@/hooks/useAnalytics";

const VERIFY_COLORS = ["#2C2DE0", "#f97316", "#9ca3af"];

const StudentsPage = () => {
    const { data, isLoading } = useAnalyticsStudents();
    const v = data?.verification ?? {};

    return (
        <PageTransition>
            <PageHeader title="Students" subtitle="Activity rankings, no-shows and verification status" />

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Users} label="Total Students" value={v.total} color="bg-blue-500" />
                <KpiCard icon={ShieldCheck} label="Verified" value={v.verified} color="bg-[#2C2DE0]" sub={`${v.verifiedPct ?? 0}% of total`} />
                <KpiCard icon={Users} label="Unverified" value={v.unverified} color="bg-orange-500" />
                <KpiCard icon={AlertTriangle} label="Pending Verification" value={v.pending} color="bg-yellow-500" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Top by reservations */}
                <Section title="Most Active — Reservations">
                    <RankList items={data?.topByReservations ?? []} nameKey="fullName" valueKey="count" labelKey="email" badgeColor="bg-blue-500" />
                </Section>

                {/* Top by check-ins */}
                <Section title="Most Active — Check-ins">
                    <RankList items={data?.topByCheckIns ?? []} nameKey="fullName" valueKey="count" badgeColor="bg-[#2C2DE0]" />
                </Section>

                {/* Top by borrowing */}
                <Section title="Most Active — Book Borrowing">
                    <RankList items={data?.topByBorrowing ?? []} nameKey="fullName" valueKey="count" badgeColor="bg-orange-500" />
                </Section>

                {/* Most no-shows */}
                <Section title="Most No-Shows">
                    <RankList items={data?.mostNoShows ?? []} nameKey="fullName" valueKey="count" badgeColor="bg-red-500" />
                </Section>

                {/* Verification pie */}
                <Section title="Verification Breakdown">
                    <div className="flex items-center gap-8">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Verified", value: v.verified ?? 0 },
                                        { name: "Unverified", value: v.unverified ?? 0 },
                                        { name: "Pending", value: v.pending ?? 0 },
                                    ]}
                                    dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={38}
                                >
                                    {VERIFY_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                            {[
                                { label: "Verified", value: v.verified, color: "#2C2DE0" },
                                { label: "Unverified", value: v.unverified, color: "#f97316" },
                                { label: "Pending", value: v.pending, color: "#9ca3af" },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <span className="ml-auto text-xs font-black text-gray-900 dark:text-white">{item.value ?? 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* New students per month */}
                <Section title="New Students per Month">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data?.newStudentsChart ?? []} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="New students" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>
        </PageTransition>
    );
};

export default StudentsPage;