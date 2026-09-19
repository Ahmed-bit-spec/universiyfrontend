import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { BookOpen, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip } from "./Analyticscomponents";
import { useAnalyticsBorrowing } from "@/hooks/useAnalytics";

const BorrowingPage = () => {
    const { data } = useAnalyticsBorrowing();

    return (
        <PageTransition>
            <PageHeader title="Borrowing" subtitle="Active borrows, overdue and return trends" />

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={BookOpen} label="Active Borrows" value={data?.activeBorrows} color="bg-blue-500" />
                <KpiCard icon={AlertTriangle} label="Overdue" value={data?.overdueCount} color="bg-red-500" sub="past due date" />
                <KpiCard icon={Clock} label="Avg Borrow Duration" value={data?.avgBorrowDuration ? `${data.avgBorrowDuration}d` : "—"} color="bg-purple-500" />
                <KpiCard icon={TrendingUp} label="Returns This Period" value={data?.returnTrend?.reduce((s, r) => s + r.returned, 0)} color="bg-[#2C2DE0]" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Weekly return trend */}
                <Section title="Weekly Returns (last 8 weeks)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data?.returnTrend ?? []} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="returned" fill="#2C2DE0" radius={[6, 6, 0, 0]} name="Returned" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Status summary */}
                <Section title="Current Status Summary">
                    <div className="space-y-4">
                        {[
                            { label: "Actively Borrowed", value: data?.activeBorrows ?? 0, color: "bg-blue-500", pct: 70 },
                            { label: "Overdue", value: data?.overdueCount ?? 0, color: "bg-red-500", pct: data?.activeBorrows > 0 ? Math.round(((data?.overdueCount ?? 0) / data.activeBorrows) * 100) : 0 },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="mb-1.5 flex justify-between text-xs">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <span className="font-black text-gray-900 dark:text-white">{item.value}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Duration info */}
                <Section title="Average Borrow Duration">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <p className="text-6xl font-black text-gray-900 dark:text-white">
                                {data?.avgBorrowDuration ?? "—"}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-500">days average</p>
                            <p className="mt-4 text-xs text-gray-400">Based on all returned books</p>
                        </div>
                    </div>
                </Section>
            </div>
        </PageTransition>
    );
};

export default BorrowingPage;