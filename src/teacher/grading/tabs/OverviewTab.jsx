import React from "react";
import {
  User, Clock, Shield, AlertTriangle, CheckCircle2,
  TrendingUp, BookOpen, Calendar,
} from "lucide-react";

export default function OverviewTab({ submission, exam }) {
  if (!submission) return null;

  const student = submission.studentId || {};
  const duration = submission.startedAt && submission.submittedAt
    ? Math.round((new Date(submission.submittedAt) - new Date(submission.startedAt)) / 60000)
    : null;

  const totalMax = submission.answers?.reduce((s, a) => s + (a.maxMarks || 0), 0) || 0;
  const autoScore = submission.totalAutoScore || 0;
  const currentScore = submission.totalScore || 0;
  const pct = totalMax > 0 ? Math.round((currentScore / totalMax) * 100) : 0;

  const cheatingLogs = submission.cheatingLogs || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">

        {/* Student card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Student Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoRow icon={User} label="Name" value={student.fullName || "—"} />
            <InfoRow icon={BookOpen} label="Student ID" value={student.universityId || student.studentId || "—"} />
            <InfoRow icon={User} label="Email" value={student.email || "—"} />
            <InfoRow icon={Calendar} label="Started" value={formatDt(submission.startedAt)} />
            <InfoRow icon={Calendar} label="Submitted" value={formatDt(submission.submittedAt)} />
            <InfoRow icon={Clock} label="Duration" value={duration !== null ? `${duration} min` : "—"} />
          </div>
        </div>

        {/* Score summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Score Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <ScoreCard label="Auto Score" value={autoScore} max={totalMax} color="blue" />
            <ScoreCard label="Final Score" value={currentScore} max={totalMax} color="green" />
            <ScoreCard label="Percentage" value={pct} suffix="%" max={100} color={pct >= 60 ? "green" : "red"} />
          </div>

          {/* Score bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Score progress</span>
              <span>{currentScore} / {totalMax} pts</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 60 ? "bg-[#2C2DE0]" : "bg-red-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question summary table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Question Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-2 text-left">#</th>
                  <th className="pb-2 text-left">Type</th>
                  <th className="pb-2 text-left">Question</th>
                  <th className="pb-2 text-right">Auto</th>
                  <th className="pb-2 text-right">Manual</th>
                  <th className="pb-2 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {(submission.answers || []).map((ans, idx) => (
                  <tr key={ans.questionId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-2">
                      <TypeBadge type={ans.questionType || ans.type} />
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {ans.questionText || "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-xs text-blue-600 dark:text-blue-400">
                      {ans.autoScore ?? 0}
                    </td>
                    <td className="py-2 text-right font-mono text-xs text-[#2C2DE0] dark:text-[#2C2DE0]">
                      {ans.manualScore ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-2 text-right text-xs text-gray-500">{ans.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">

        {/* Flags */}
        {(submission.flags?.length > 0 || submission.needsReview) && (
          <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400">Flags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(submission.flags || []).map((f) => (
                <span key={f} className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-md">
                  {f.replace(/_/g, " ")}
                </span>
              ))}
              {submission.needsReview && (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-md">
                  needs manual review
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cheating log */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className={`w-4 h-4 ${cheatingLogs.length > 0 ? "text-red-500" : "text-[#2C2DE0]"}`} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security Log</h3>
            {cheatingLogs.length === 0 && (
              <span className="ml-auto text-xs text-[#2C2DE0] dark:text-[#2C2DE0] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Clean
              </span>
            )}
          </div>
          {cheatingLogs.length === 0 ? (
            <p className="text-xs text-gray-500">No violations detected.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cheatingLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      {log.action?.replace(/_/g, " ")}
                    </p>
                    <p className="text-gray-400">{formatDt(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Exam</h3>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">{exam?.title}</p>
            <p className="text-gray-500">Duration: {exam?.duration} min</p>
            <p className="text-gray-500">Max marks: {exam?.totalMaxMarks ?? totalMax}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {value}
      </p>
    </div>
  );
}

function ScoreCard({ label, value, max, color, suffix = "" }) {
  const colors = {
    green: "text-[#2C2DE0] dark:text-[#2C2DE0]",
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
      <p className={`text-2xl font-black ${colors[color] || "text-gray-900 dark:text-white"}`}>
        {value}{suffix}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function TypeBadge({ type }) {
  const colors = {
    mcq: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    essay: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    lab: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    truefalse: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    os_linux: "bg-[#2C2DE0] text-white dark:bg-[#2C2DE0]/10 dark:text-[#2C2DE0]",
    design_lab: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${colors[type] || "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"}`}>
      {type?.replace(/_/g, " ")}
    </span>
  );
}

function formatDt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
