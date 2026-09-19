import { Tooltip, ResponsiveContainer } from "recharts";

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export const KpiCard = ({ icon: Icon, label, value, sub, color, trend, trendValue }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200/70 bg-white/60 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white dark:bg-gray-900/[0.04]">
    <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value ?? "—"}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
    {trendValue != null && (
      <div className={`shrink-0 text-right ${trend === "up" ? "text-[#2C2DE0]" : "text-red-400"}`}>
        <p className="text-xs font-black">{trend === "up" ? "↑" : "↓"} {Math.abs(trendValue)}%</p>
        <p className="text-[9px] text-gray-400">vs last mo.</p>
      </div>
    )}
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
export const Section = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-200/70 bg-white/60 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white dark:bg-gray-900/[0.04] ${className}`}>
    {title && (
      <p className="mb-5 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 dark:text-gray-400">
        {title}
      </p>
    )}
    {children}
  </div>
);

// ─── Custom recharts tooltip ──────────────────────────────────────────────────
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white px-3 py-2 shadow-xl dark:border-white/10 dark:bg-gray-900">
      <p className="mb-1 text-[10px] font-bold text-gray-500 dark:text-gray-400">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-black" style={{ color: p.color }}>
          {p.name ?? p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Period selector ──────────────────────────────────────────────────────────
export const PeriodSelector = ({ value, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white dark:bg-gray-900/5">
    {[
      { label: "7 days", value: "7d" },
      { label: "30 days", value: "30d" },
      { label: "12 months", value: "12m" },
    ].map((opt) => (
      <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
          value === opt.value
            ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ─── Ranked list ──────────────────────────────────────────────────────────────
export const RankList = ({ items = [], valueKey = "count", nameKey = "fullName", labelKey, badgeColor = "bg-[#2C2DE0]" }) => {
  const max = items[0]?.[valueKey] || 1;
  return (
    <div className="space-y-2.5">
      {items.slice(0, 8).map((item, i) => (
        <div key={item._id ?? i} className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-black text-gray-600 dark:bg-white/10 dark:text-gray-300">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
              {item[nameKey]}
            </p>
            {labelKey && (
              <p className="truncate text-[10px] text-gray-400">{item[labelKey]}</p>
            )}
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white dark:bg-gray-900/10">
              <div
                className={`h-full rounded-full ${badgeColor} transition-all duration-500`}
                style={{ width: `${Math.min(100, (item[valueKey] / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-xs font-black text-gray-700 dark:text-gray-300">
            {item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat pill ────────────────────────────────────────────────────────────────
export const StatPill = ({ label, value, color = "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300" }) => (
  <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${color}`}>
    <span className="text-xs font-semibold opacity-70">{label}</span>
    <span className="ml-auto text-sm font-black">{value}</span>
  </div>
);

// ─── Heatmap ─────────────────────────────────────────────────────────────────
const HOUR_LABELS = ["7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM"];
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const HeatCell = ({ value, max }) => {
  const t = max > 0 ? value / max : 0;
  const bg = t === 0
    ? "bg-gray-100 dark:bg-white dark:bg-gray-900/5"
    : t < 0.25  ? "bg-emerald-100 dark:bg-emerald-900/30"
    : t < 0.5   ? "bg-emerald-300 dark:bg-emerald-700/50"
    : t < 0.75  ? "bg-emerald-500 dark:bg-emerald-500/70"
    :              "bg-emerald-700 dark:bg-emerald-400";
  return (
    <div title={value ? `${value} reservations` : ""}
      className={`flex h-7 items-center justify-center rounded text-[8px] font-bold text-gray-600 dark:text-gray-300 ${bg}`}>
      {value || ""}
    </div>
  );
};

export const Heatmap = ({ data = [] }) => {
  const max = Math.max(1, ...data.flatMap(row => row.values ?? []));
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="mb-1 grid gap-1" style={{ gridTemplateColumns: `44px repeat(16,1fr)` }}>
          <div />
          {HOUR_LABELS.map(h => (
            <div key={h} className="text-center text-[8px] font-semibold text-gray-400">{h}</div>
          ))}
        </div>
        {DAY_LABELS.map((day, di) => (
          <div key={day} className="mb-1 grid gap-1" style={{ gridTemplateColumns: `44px repeat(16,1fr)` }}>
            <div className="flex items-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">{day}</div>
            {HOUR_LABELS.map((_, hi) => (
              <HeatCell key={hi} value={data[di]?.values?.[hi] ?? 0} max={max} />
            ))}
          </div>
        ))}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[9px] text-gray-400">Low</span>
          {["bg-gray-100 dark:bg-white dark:bg-gray-900/5","bg-emerald-100","bg-emerald-300","bg-emerald-500","bg-emerald-700"].map((c,i) => (
            <div key={i} className={`h-3 w-5 rounded ${c}`} />
          ))}
          <span className="text-[9px] text-gray-400">High</span>
        </div>
      </div>
    </div>
  );
};

// ─── Overdue table ────────────────────────────────────────────────────────────
export const OverdueTable = ({ rows = [] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-100 dark:border-white/10">
          {["Book","Student","Due Date","Days Overdue"].map(h => (
            <th key={h} className="pb-2 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white dark:bg-gray-900/[0.02]">
            <td className="py-2.5 pr-4 font-semibold text-gray-900 dark:text-white">{r.book}</td>
            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{r.student}</td>
            <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{new Date(r.dueDate).toLocaleDateString()}</td>
            <td className="py-2.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                r.daysOverdue > 14 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : r.daysOverdue > 7  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                :                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {r.daysOverdue}d
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);