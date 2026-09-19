import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const getTabs = (w) => [
  { key: "7d",    label: w.days7     },
  { key: "30d",   label: w.days30    },
  { key: "peak",  label: w.peakHours },
  { key: "zones", label: w.zones      },
];

// Shown only when the server returns a completely empty lineData array
const EMPTY_7D = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    name:  d.toLocaleDateString("en-US", { weekday: "short" }),
    value: 0,
  };
});

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs font-mono shadow-lg",
        isDark
          ? "bg-black border-white/15 text-white"
          : "bg-white border-black/10 text-black"
      )}
    >
      <p className="text-[#2C2DE0] font-bold">{payload[0].value}</p>
      <p className={isDark ? "text-white/40" : "text-black/40"}>{label}</p>
    </div>
  );
};

const ReservationAnalyticsWidget = ({
  lineData      = [],
  statusBreakdown = {},
  peakData      = [],
  zoneData      = [],
}) => {
  const [tab, setTab] = useState("7d");
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const w = t.adminPanel.pages.dashboard.widgets;
  
  const TABS = useMemo(() => getTabs(w), [w]);

  // ── 7-day tab ─────────────────────────────────────────────────────────────
  // Server returns: { date, seatReservations, bookReservations }
  // Chart needs:   { name, value }
  const normalised7d = useMemo(() => {
    if (!lineData.length) return EMPTY_7D;
    return lineData.map((d) => ({
      name:  d.date ?? d.name ?? "",
      value: (d.seatReservations ?? 0) + (d.bookReservations ?? 0),
    }));
  }, [lineData]);

  // ── 30-day tab ────────────────────────────────────────────────────────────
  // Server returns: { seat: { active:N, … }, book: { pending:N, … } }
  // We merge both objects and sum counts per status.
  const breakdownData = useMemo(() => {
    const merged = {};
    const seatObj = statusBreakdown?.seat ?? {};
    const bookObj = statusBreakdown?.book ?? {};

    // handle flat object too (legacy shape)
    const isFlatObject =
      !statusBreakdown?.seat &&
      !statusBreakdown?.book &&
      typeof statusBreakdown === "object";

    const source = isFlatObject
      ? { seat: statusBreakdown, book: {} }
      : { seat: seatObj, book: bookObj };

    for (const [status, count] of Object.entries(source.seat)) {
      merged[status] = (merged[status] ?? 0) + Number(count);
    }
    for (const [status, count] of Object.entries(source.book)) {
      merged[status] = (merged[status] ?? 0) + Number(count);
    }

    return Object.entries(merged).map(([name, value]) => ({
      name:  name.replace(/_/g, " "),
      value,
    }));
  }, [statusBreakdown]);

  // ── peak-hours tab ────────────────────────────────────────────────────────
  // Server returns: { hour, count }  →  chart needs { name, value }
  const normalisedPeak = useMemo(
    () => peakData.map((d) => ({ name: d.hour ?? d.name, value: d.count ?? d.value ?? 0 })),
    [peakData]
  );

  // ── zones tab ─────────────────────────────────────────────────────────────
  // Server already returns { name, value } — no transform needed.
  const normalisedZones = useMemo(
    () => zoneData.map((d) => ({ name: d.name, value: d.value ?? 0 })),
    [zoneData]
  );

  // ── active dataset ────────────────────────────────────────────────────────
  const data = useMemo(() => {
    switch (tab) {
      case "7d":    return normalised7d;
      case "30d":   return breakdownData.length  ? breakdownData   : [];
      case "peak":  return normalisedPeak.length  ? normalisedPeak  : [];
      case "zones": return normalisedZones.length ? normalisedZones : [];
      default:      return [];
    }
  }, [tab, normalised7d, breakdownData, normalisedPeak, normalisedZones]);

  const isBar   = tab === "peak" || tab === "zones" || tab === "30d";
  const axisClr = isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)";
  const gridClr = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)";
  const base    = isDark ? "bg-black border-white/10" : "bg-white border-black/8";

  const isEmpty = data.length === 0 || data.every((d) => (d.value ?? 0) === 0);

  return (
    <div className={cn("rounded-xl border p-5 h-full", base)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-black"
          )}
        >
          {w.reservationAnalytics}
        </h3>

        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "text-[11px] font-semibold px-3 py-1 rounded-md transition-colors",
                tab === t.key
                  ? "bg-[#2C2DE0] text-black"
                  : isDark
                  ? "text-white/40 hover:text-white hover:bg-white/6"
                  : "text-black/40 hover:text-black hover:bg-black/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ height: 240 }}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <p className={cn("text-xs", isDark ? "text-white/25" : "text-black/25")}>
              {w.noData}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {isBar ? (
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridClr}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: axisClr }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisClr }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip isDark={isDark} />}
                  cursor={{
                    fill: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? "#2C2DE0"
                          : isDark
                          ? "rgba(255,255,255,.15)"
                          : "rgba(0,0,0,.1)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#2C2DE0" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2C2DE0" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridClr}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: axisClr }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisClr }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2C2DE0"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#2C2DE0",
                    stroke: isDark ? "#000" : "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default ReservationAnalyticsWidget;