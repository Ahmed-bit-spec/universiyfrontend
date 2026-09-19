import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import { KpiCard, Section, ChartTooltip, RankList, OverdueTable } from "./Analyticscomponents";
import { useAnalyticsBooks } from "@/hooks/useAnalytics";

const PIE_COLORS = ["#2C2DE0", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#9ca3af", "#14b8a6", "#f59e0b"];

const BooksPage = () => {
    const { data, isLoading } = useAnalyticsBooks();
    const ret = data?.returnPerformance ?? {};
    const status = data?.statusBreakdown ?? {};

    return (
        <PageTransition>
            <PageHeader title="Books" subtitle="Borrowing patterns, unused stock and overdue tracking" />

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={BookOpen} label="Borrowed Now" value={status.borrowed ?? 0} color="bg-orange-500" />
                <KpiCard icon={AlertTriangle} label="Overdue" value={data?.overdueBooks?.length ?? 0} color="bg-red-500" />
                <KpiCard icon={CheckCircle} label="Returned On Time" value={`${ret.onTimePct ?? 0}%`} color="bg-[#2C2DE0]" sub={`${ret.onTime ?? 0} books`} />
                <KpiCard icon={BookOpen} label="Unused Books" value={data?.unusedBooks?.length ?? 0} color="bg-gray-500" sub="never borrowed" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Most borrowed */}
                <Section title="Most Borrowed Books">
                    <RankList
                        items={data?.topBorrowed ?? []}
                        nameKey="title"
                        valueKey="count"
                        labelKey="author"
                        badgeColor="bg-orange-500"
                    />
                </Section>

                {/* Category breakdown */}
                <Section title="Category Breakdown">
                    <div className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie data={data?.categoryBreakdown ?? []} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" outerRadius={70} innerRadius={38}>
                                    {(data?.categoryBreakdown ?? []).map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                            {(data?.categoryBreakdown ?? []).map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{item.name}</span>
                                    <span className="ml-auto text-xs font-black text-gray-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Monthly borrow trend */}
                <Section title="Borrowing Trend (12 months)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data?.borrowsChart ?? []} barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Borrows" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Return performance */}
                <Section title="Return Performance">
                    <div className="mb-4 flex gap-4">
                        {[
                            { label: "On Time", value: ret.onTime ?? 0, color: "bg-[#2C2DE0]" },
                            { label: "Late", value: ret.late ?? 0, color: "bg-red-400" },
                        ].map(item => (
                            <div key={item.label} className="flex-1 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                                <p className="text-[10px] font-semibold text-gray-500">{item.label}</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                            className="h-full rounded-full bg-[#2C2DE0] transition-all duration-700"
                            style={{ width: `${ret.onTimePct ?? 0}%` }}
                        />
                    </div>
                    <p className="mt-1.5 text-[10px] text-gray-400">{ret.onTimePct ?? 0}% returned on time</p>
                </Section>

                {/* Status breakdown */}
                <Section title="Reservation Status Breakdown">
                    <div className="space-y-2">
                        {Object.entries(data?.statusBreakdown ?? {}).map(([status, count]) => {
                            const total = Object.values(data?.statusBreakdown ?? {}).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className="w-20 text-[10px] font-semibold capitalize text-gray-500">{status.replace("_", " ")}</span>
                                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-8 text-right text-[10px] font-black text-gray-700 dark:text-gray-300">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                {/* Overdue table */}
                {(data?.overdueBooks?.length > 0) && (
                    <Section title={`Overdue Books (${data.overdueBooks.length})`} className="lg:col-span-2">
                        <OverdueTable rows={data.overdueBooks} />
                    </Section>
                )}

                {/* Unused books */}
                {(data?.unusedBooks?.length > 0) && (
                    <Section title="Never-Borrowed Books" className="lg:col-span-2">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {data.unusedBooks.map(b => (
                                <div key={b._id} className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
                                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{b.title}</p>
                                    <p className="truncate text-[10px] text-gray-500">{b.author}</p>
                                    {b.category && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-400">{b.category}</span>}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </PageTransition>
    );
};

export default BooksPage;