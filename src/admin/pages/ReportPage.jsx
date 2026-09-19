import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { fetchReport, downloadReportPdf, downloadReportExcel } from "../../api/reportApi";

const BRAND = "#2C2DE0";
const BRAND_DARK = "#1E1FAA";
const MUTED = "#6B7280";
const INK = "#111827";
const BORDER = "#E5E7EB";
const SURFACE = "#F8FAFC";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function BrandButton({ children, onClick, disabled, variant = "primary", className = "" }) {
  const primary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-40 ${className}`}
      style={
        primary
          ? { background: BRAND, color: "#fff", boxShadow: `0 3px 0 ${BRAND_DARK}` }
          : { background: SURFACE, color: BRAND, border: `1px solid ${BORDER}` }
      }
    >
      {children}
    </button>
  );
}

function DeltaBadge({ pct }) {
  const positive = pct >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold"
      style={{ color: positive ? BRAND : "#C0392B" }}
    >
      <Icon size={12} />
      {positive ? "+" : ""}
      {pct}%
    </span>
  );
}

function KpiCard({ label, value, deltaPct, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <Icon size={16} color={BRAND} />
      </div>
      <div className="text-[24px] font-extrabold text-gray-900 dark:text-white">{value}</div>
      {deltaPct !== undefined && (
        <div className="mt-1">
          <DeltaBadge pct={deltaPct} />
        </div>
      )}
    </div>
  );
}

function TrendChart({ trend }) {
  if (!trend?.length) {
    return <p className="text-[13px] font-semibold text-gray-500">No activity recorded yet.</p>;
  }
  const max = Math.max(...trend.map((t) => t.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {trend.map((t) => (
        <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md"
            style={{
              height: `${Math.max((t.count / max) * 100, 4)}%`,
              background: BRAND,
            }}
            title={`${t.date}: ${t.count}`}
          />
          <span className="text-[9px] font-semibold text-gray-400">{t.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [anchorDate, setAnchorDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState(null);
  const [showAiNotice, setShowAiNotice] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["report", period, anchorDate],
    queryFn: () => fetchReport(period, anchorDate),
    staleTime: 30_000,
  });

  const shiftDate = (dir) => {
    const d = new Date(anchorDate);
    const deltaDays = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    d.setDate(d.getDate() + dir * deltaDays);
    setAnchorDate(d.toISOString().slice(0, 10));
  };

  const handleDownload = async (kind) => {
    setDownloading(kind);
    try {
      if (kind === "pdf") await downloadReportPdf(period, anchorDate);
      else await downloadReportExcel(period, anchorDate);
    } catch (err) {
      console.error(`Report ${kind} export failed:`, err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-extrabold text-gray-900 dark:text-white">
            Library Reports
          </h1>
          <p className="text-[13px] font-semibold text-gray-500 mt-0.5">
            Live figures from seats, borrows, attendance, and users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BrandButton onClick={() => handleDownload("pdf")} disabled={!report || downloading === "pdf"}>
            <Download size={15} />
            {downloading === "pdf" ? "Preparing…" : "Download PDF"}
          </BrandButton>
          <BrandButton
            variant="secondary"
            onClick={() => handleDownload("excel")}
            disabled={!report || downloading === "excel"}
          >
            <FileSpreadsheet size={15} />
            {downloading === "excel" ? "Preparing…" : "Download Excel"}
          </BrandButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 rounded-2xl p-1 bg-gray-100 dark:bg-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className="text-[12px] font-bold rounded-xl px-4 py-2 transition-all duration-150"
              style={
                period === p.key
                  ? { background: BRAND, color: "white", boxShadow: `0 2px 0 ${BRAND_DARK}` }
                  : { color: MUTED }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10"
          >
            <ChevronLeft size={14} color={MUTED} />
          </button>
          <span className="text-[13px] font-bold text-gray-900 dark:text-white">
            {report?.rangeLabel ?? "…"}
          </span>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10"
          >
            <ChevronRight size={14} color={MUTED} />
          </button>
        </div>
      </div>

      {isLoading && <p className="text-[13px] font-semibold text-gray-500">Loading report…</p>}
      {isError && (
        <p className="text-[13px] font-semibold text-red-500">Couldn&apos;t load this report. Try again.</p>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Reservations"
              value={report.summary?.totalReservations ?? 0}
              deltaPct={report.comparison?.totalReservationsChangePct}
              icon={Clock3}
            />
            <KpiCard
              label="Books Borrowed"
              value={report.summary?.totalBorrows ?? 0}
              deltaPct={report.comparison?.totalBorrowsChangePct}
              icon={BookOpen}
            />
            <KpiCard
              label="Attendance Rate"
              value={`${report.summary?.attendanceRate ?? 0}%`}
              deltaPct={report.comparison?.attendanceRateChangePct}
              icon={Users}
            />
            <KpiCard
              label="New Students"
              value={report.summary?.newStudents ?? 0}
              deltaPct={report.comparison?.newStudentsChangePct}
              icon={Users}
            />
          </div>

          <div className="flex items-center gap-4 mb-6 text-[12px] font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={13} color="#C0392B" /> {report.summary?.overdueBooks ?? 0} overdue
            </span>
            <span>{report.summary?.noShowCount ?? 0} no-shows</span>
            <span>{report.summary?.cancelledCount ?? 0} cancelled</span>
          </div>

          <div className="rounded-2xl p-5 mb-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10">
            <h3 className="text-[13px] font-extrabold mb-4 text-gray-900 dark:text-white">
              Reservations trend
            </h3>
            <TrendChart trend={report.trend} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl p-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10">
              <h3 className="text-[13px] font-extrabold mb-3 text-gray-900 dark:text-white">
                Top borrowed books
              </h3>
              {(report.topBooks ?? []).length === 0 ? (
                <p className="text-[12px] font-semibold text-gray-500">No borrows this period.</p>
              ) : (
                <div className="space-y-2">
                  {report.topBooks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {i + 1}. {b.title}
                      </span>
                      <span className="font-bold" style={{ color: BRAND }}>
                        {b.borrowCount}×
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10">
              <h3 className="text-[13px] font-extrabold mb-3 text-gray-900 dark:text-white">
                Usage by department
              </h3>
              {(report.departmentUsage ?? []).length === 0 ? (
                <p className="text-[12px] font-semibold text-gray-500">No reservation activity this period.</p>
              ) : (
                <div className="space-y-2">
                  {report.departmentUsage.map((d) => (
                    <div key={d.department}>
                      <div className="flex justify-between text-[12px] font-semibold mb-0.5 text-gray-800 dark:text-gray-200">
                        <span>{d.department}</span>
                        <span>{d.percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${d.percent}%`, background: BRAND }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} color={BRAND} />
                <span className="text-[13px] font-extrabold text-gray-900 dark:text-white">
                  Explain this report with AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiNotice(true)}
                className="text-[12px] font-bold rounded-xl px-4 py-2"
                style={{ background: SURFACE, color: BRAND }}
              >
                Coming soon
              </button>
            </div>
            {showAiNotice && (
              <p className="mt-3 text-[12px] text-gray-500">
                AI report explanations will ship in a later release. Current reports already use live library data.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
