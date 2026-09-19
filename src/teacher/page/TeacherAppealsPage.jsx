import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  MessageSquare, Loader2, CheckCircle2, XCircle, AlertCircle,
  Clock, ArrowRight, RefreshCw, Send, CheckSquare
} from "lucide-react";

export default function TeacherAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution form state
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [statusAction, setStatusAction]     = useState("accepted");
  const [teacherNote, setTeacherNote]       = useState("");
  const [modifiedScore, setModifiedScore]   = useState("");
  const [submitting, setSubmitting]         = useState(false);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/grade-appeals/teacher");
      setAppeals(data.data.appeals || []);
    } catch (err) {
      toast.error("Failed to load grade appeals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppeal) return;
    try {
      setSubmitting(true);
      await axios.put(`/api/grade-appeals/${selectedAppeal._id}/resolve`, {
        status:       statusAction,
        teacherNote,
        modifiedScore: statusAction === "modified" ? Number(modifiedScore) : undefined,
      });
      toast.success(`Appeal resolved as ${statusAction}!`);
      setSelectedAppeal(null);
      setTeacherNote("");
      setModifiedScore("");
      fetchAppeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve appeal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#2C2DE0]" />
            Grade Appeals
          </h1>
          <p className="text-gray-500 text-sm">
            Review and resolve student disputes regarding rubric scoring and feedback.
          </p>
        </div>
        <button
          onClick={fetchAppeals}
          disabled={loading}
          className="p-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#2C2DE0]" : ""}`} />
        </button>
      </div>

      {/* Resolution Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Resolve Grade Appeal</h3>
              <button onClick={() => setSelectedAppeal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400">✕</button>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-lg text-xs space-y-1">
              <p><span className="font-bold text-gray-700 dark:text-gray-300">Student: </span>{selectedAppeal.studentId?.fullName}</p>
              <p><span className="font-bold text-gray-700 dark:text-gray-300">Reason: </span>{selectedAppeal.reason}</p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-semibold">Decision</label>
                <div className="flex gap-2">
                  {[
                    { id: "accepted", label: "Accept" },
                    { id: "rejected", label: "Reject" },
                    { id: "modified", label: "Modify Score" },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setStatusAction(act.id)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all
                        ${statusAction === act.id
                          ? "bg-[#2C2DE0]/15 border-[#2C2DE0]/40 text-[#1E1FAA] dark:bg-[#2C2DE0]/20 dark:border-[#2C2DE0]/50 dark:text-[#A5A6FF]"
                          : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {statusAction === "modified" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Score</label>
                  <input
                    type="number"
                    required
                    step={0.5}
                    min={0}
                    value={modifiedScore}
                    onChange={(e) => setModifiedScore(e.target.value)}
                    placeholder="Enter final modified score..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Decision Explanation</label>
                <textarea
                  rows={3}
                  required
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="Explain decision to student..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-[#2C2DE0] focus:outline-none resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white font-bold rounded-xl shadow-md disabled:opacity-50 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                Submit Decision
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2C2DE0]" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">All caught up!</p>
          <p className="text-xs text-gray-500 mt-1">No grade appeals currently pending resolution.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-800/20">
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Exam</th>
                  <th className="px-6 py-4 text-left">Disputed reason</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {appeals.map((ap) => (
                  <tr key={ap._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/10">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{ap.studentId?.fullName}</div>
                      <div className="text-xs text-gray-500">ID: {ap.studentId?.studentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 dark:text-zinc-200">{ap.examId?.title}</div>
                      <div className="text-xs text-gray-400">
                        Type: {ap.questionId ? "Question Specific" : "Overall Grade"}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate text-gray-600 dark:text-gray-400 font-medium">
                      {ap.reason}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${ap.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" :
                          ap.status === "modified" || ap.status === "accepted" ? "bg-[#2C2DE0] text-white dark:bg-[#2C2DE0]/10 dark:text-[#2C2DE0]" :
                                                        "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {ap.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ap.status === "pending" ? (
                        <button
                          onClick={() => { setSelectedAppeal(ap); setStatusAction("accepted"); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 text-[#2C2DE0] dark:text-[#2C2DE0] rounded-lg hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/20 transition-all"
                        >
                          Resolve <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
