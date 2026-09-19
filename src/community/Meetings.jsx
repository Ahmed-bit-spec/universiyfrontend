/**
 * Meetings.jsx — Meetings Dashboard
 *
 * COLOR SYSTEM: white background · black text · #2C2DE0 green accents ONLY.
 * This is the light-mode dashboard page (meeting ROOM is dark/black).
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video, Plus, LogIn, Users, Clock, Calendar,
  Search, Copy, Download, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, Lock, Zap, ChevronDown, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth }     from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import {
  createMeeting, listMeetings, joinMeeting,
  joinMeetingsLobby, onMeetingUpdated, onMeetingEnded,
} from "@/api/meetingApi";
import { Spinner } from "./ui";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getMeetingStatus(m) {
  if (m.isActive && !m.endedAt) return "live";
  if (m.endedAt) return "ended";
  return "upcoming";
}

function formatDate(iso) {
  if (!iso) return "Unscheduled";
  const d        = new Date(iso);
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === today.toDateString())    return `Today · ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${time}`;
  return (
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
    ` · ${time}`
  );
}

function downloadIcs(meeting) {
  const fmt  = (iso) => new Date(iso || Date.now()).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const start = meeting.scheduledAt || meeting.createdAt || new Date().toISOString();
  const end   = meeting.endedAt     || new Date(new Date(start).getTime() + 2 * 3600000).toISOString();
  const ics   = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${meeting._id}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:Code: ${meeting.meetingCode}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = Object.assign(document.createElement("a"), {
    href:     URL.createObjectURL(new Blob([ics], { type: "text/calendar" })),
    download: `${meeting.meetingCode}.ics`,
  });
  a.click();
  toast.success("Calendar event downloaded (.ics)");
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge — green for live, black for everything else
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#2C2DE0] text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-900 animate-pulse" />
        Live
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border-2 border-black/20 text-black">
        <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
        Upcoming
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border-2 border-black/10 text-black/40">
      Ended
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting Card
// ─────────────────────────────────────────────────────────────────────────────
function MeetingCard({ meeting, onJoin, onDetails }) {
  const status = getMeetingStatus(meeting);
  const host   = meeting.hostId?.name ?? meeting.host?.name ?? "Faculty";
  const canJoin = status === "live" || status === "upcoming";

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-900 border-2 rounded-2xl p-5 flex flex-col gap-4
        cursor-pointer transition-all duration-200 hover:shadow-lg
        ${status === "live"
          ? "border-[#2C2DE0] shadow-[0_0_0_4px_rgba(44,45,224,0.08)] hover:shadow-[0_0_0_4px_rgba(44,45,224,0.15)]"
          : "border-black/10 hover:border-black/20"
        }
      `}
      onClick={() => onDetails(meeting)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={status} />
            <span className="text-[10px] font-bold text-black/30 uppercase tracking-wider">
              {meeting.roomType ?? "Lecture"}
            </span>
          </div>
          <h3 className="text-black font-black text-sm leading-snug">{meeting.title}</h3>
          <p className="text-[#2C2DE0] text-xs font-bold mt-0.5">{meeting.course ?? "General"}</p>
        </div>
        <div className="text-[10px] font-mono text-black/30 bg-black/5 px-2 py-1 rounded-lg shrink-0">
          {meeting.meetingCode}
        </div>
      </div>

      <div className="space-y-1.5 text-[11px] text-black/50">
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-black/30" />
          Host: <strong className="text-black/70">{host}</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-black/30" />
          {formatDate(meeting.scheduledAt || meeting.createdAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-black/30" />
          {meeting.participants?.length ?? 0} joined
          {meeting.isLocked && <Lock size={10} className="text-black/40 ml-auto" />}
        </div>
      </div>

      <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        {canJoin ? (
          <button
onClick={() => onJoin(meeting.meetingCode)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2C2DE0] text-white text-xs font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all"
          >
            <Video size={13} /> Join
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-black/10 text-black/30 text-xs font-semibold">
            <XCircle size={12} /> Ended
          </div>
        )}
        <button
onClick={() => downloadIcs(meeting)}
          title="Add to calendar"
          className="px-3.5 py-2.5 rounded-xl border-2 border-black/10 hover:border-black/20 text-black/40 hover:text-black transition-colors"
        >
          <Calendar size={14} />
        </button>
        <button
onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/community/meetings/room/${meeting.meetingCode}`
            );
            toast.success("Link copied");
          }}
          title="Copy invite link"
          className="px-3.5 py-2.5 rounded-xl border-2 border-black/10 hover:border-black/20 text-black/40 hover:text-black transition-colors"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting Details Drawer (slides in from right)
// ─────────────────────────────────────────────────────────────────────────────
function MeetingDetailsDrawer({ meeting, onClose, onJoin }) {
  if (!meeting) return null;
  const status  = getMeetingStatus(meeting);
  const host    = meeting.hostId?.name ?? meeting.host?.name ?? "Faculty";
  const canJoin = status === "live" || status === "upcoming";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white dark:bg-gray-900 border-l-2 border-black/10 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b-2 border-black/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={status} />
              <span className="text-[10px] font-bold text-black/30 uppercase">{meeting.roomType}</span>
            </div>
            <h2 className="text-black font-black text-xl">{meeting.title}</h2>
            <p className="text-[#2C2DE0] font-bold mt-1">{meeting.course}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            <X size={15} />
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 p-6 border-b-2 border-black/10">
          {[
            { label: "Host",         value: host },
            { label: "Code",         value: meeting.meetingCode, mono: true },
            { label: "Date",         value: formatDate(meeting.scheduledAt || meeting.createdAt) },
            { label: "Participants", value: meeting.participants?.length ?? 0 },
            { label: "Room Type",    value: meeting.roomType ?? "Lecture" },
            { label: "Status",       value: status },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-black/5 rounded-xl p-3">
              <p className="text-black/40 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-black text-sm font-bold ${mono ? "font-mono tracking-wider text-[#2C2DE0]" : ""} truncate`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3 mt-auto">
          {canJoin && (
            <button
onClick={() => onJoin(meeting.meetingCode)}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#2C2DE0] text-white font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all"
            >
              <Video size={18} /> Join Meeting Room
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/community/meetings/room/${meeting.meetingCode}`
                );
                toast.success("Link copied");
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black/10 hover:border-black/20 text-black/70 text-xs font-bold transition-colors"
            >
              <Copy size={13} /> Copy Link
            </button>
            <button
onClick={() => downloadIcs(meeting)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black/10 hover:border-black/20 text-black/70 text-xs font-bold transition-colors"
            >
              <Calendar size={13} /> Add to Cal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Meetings Page
// ─────────────────────────────────────────────────────────────────────────────
const COURSES    = ["Operating Systems", "Database Systems", "Software Engineering", "Discrete Mathematics", "Computer Networks", "Algorithms", "General Class"];
const ROOM_TYPES = ["Lecture", "Lab Session", "Discussion", "Presentation", "Office Hours"];

export default function Meetings() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [meetings,      setMeetings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [detailsMeeting, setDetailsMeeting] = useState(null);

  // Create form
  const [showCreate,   setShowCreate]   = useState(false);
  const [createForm,   setCreateForm]   = useState({
    title: "", course: "Operating Systems", roomType: "Lecture",
    isScheduled: false, scheduledAt: "",
  });
  const [creating,     setCreating]     = useState(false);

  // Join
  const [joinCode,  setJoinCode]  = useState("");
  const [joining,   setJoining]   = useState(false);

  const canCreate = ["teacher", "admin"].includes(user?.role);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await listMeetings();
      if (r.success) setMeetings(r.meetings ?? []);
    } catch { toast.error("Failed to load meetings"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    joinMeetingsLobby();
    loadData();
    const offU = onMeetingUpdated(() => loadData(true));
    const offE = onMeetingEnded(()   => loadData(true));
    return () => { offU(); offE(); };
  }, [loadData]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const goToRoom = (code) => navigate(`/community/meetings/room/${code}`);

  const handleJoin = async (e) => {
    e?.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    try {
      await joinMeeting(code);
      goToRoom(code);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Could not join meeting");
    } finally { setJoining(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) { toast.error("Title is required"); return; }
    setCreating(true);
    try {
      const r = await createMeeting({
        title:       createForm.title.trim(),
        course:      createForm.course,
        roomType:    createForm.roomType,
        scheduledAt: createForm.isScheduled && createForm.scheduledAt
          ? new Date(createForm.scheduledAt).toISOString()
          : null,
      });
      if (r.success) {
        toast.success(`Created! Code: ${r.meeting.meetingCode}`);
        setShowCreate(false);
        setCreateForm({ title: "", course: "Operating Systems", roomType: "Lecture", isScheduled: false, scheduledAt: "" });
        loadData(true);
        if (!createForm.isScheduled) goToRoom(r.meeting.meetingCode);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to create meeting");
    } finally { setCreating(false); }
  };

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filtered = meetings.filter((m) => {
    const status  = getMeetingStatus(m);
    const q       = searchQuery.toLowerCase();
    const host    = m.hostId?.name ?? m.host?.name ?? "";
    const matchQ  = !q || m.title?.toLowerCase().includes(q)
                       || m.course?.toLowerCase().includes(q)
                       || m.meetingCode?.toLowerCase().includes(q)
                       || host.toLowerCase().includes(q);
    const matchS  = statusFilter === "all" || status === statusFilter;
    return matchQ && matchS;
  });

  const liveMeetings = meetings.filter((m) => getMeetingStatus(m) === "live");

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-white dark:bg-gray-900 text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2C2DE0] flex items-center justify-center shadow-[0_6px_0_#1E1FAA]">
              <Video size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black">Class Meetings</h1>
              <p className="text-black/40 text-sm">UniCore virtual classroom platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {liveMeetings.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2C2DE0]/10 border-2 border-[#2C2DE0]/30">
                <span className="w-2 h-2 rounded-full bg-[#2C2DE0] animate-pulse" />
                <span className="text-[#2C2DE0] text-xs font-bold">{liveMeetings.length} Live Now</span>
              </div>
            )}
            <button
onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-2.5 rounded-xl border-2 border-black/10 hover:border-black/20 text-black/40 hover:text-black transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ══ QUICK ACTIONS ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Join card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <LogIn size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-black font-black text-sm">Join a Meeting</h2>
                <p className="text-black/40 text-xs">Enter the code from your lecturer</p>
              </div>
            </div>
            <form onSubmit={handleJoin} className="flex gap-2.5">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="A3B2C1"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#2C2DE0] text-black font-mono text-center text-sm tracking-[0.3em] placeholder:text-black/20 focus:outline-none uppercase transition-colors"
              />
              <button
                type="submit"
                disabled={joining || joinCode.trim().length < 4}
                className="px-5 py-3 rounded-xl bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50"
              >
                {joining ? <Spinner size={16} /> : "Join"}
              </button>
            </form>
          </div>

          {/* Create card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2C2DE0] flex items-center justify-center shadow-[0_4px_0_#1E1FAA]">
                  <Plus size={17} className="text-white" />
                </div>
                <div>
                  <h2 className="text-black font-black text-sm">Start or Schedule</h2>
                  <p className="text-black/40 text-xs">
                    {canCreate ? "Create a new class session" : "Only teachers can create meetings"}
                  </p>
                </div>
              </div>
              {canCreate && (
                <button
onClick={() => setShowCreate(!showCreate)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2
                    ${showCreate
                      ? "border-black/10 text-black hover:bg-black/5"
                      : "bg-[#2C2DE0] border-[#2C2DE0] text-white shadow-[0_3px_0_#1E1FAA] hover:translate-y-0.5"
                    }`}
                >
                  {showCreate ? "Cancel" : "Create"}
                </button>
              )}
            </div>

            {!canCreate ? (
              <div className="flex items-center gap-2 p-3 bg-black/5 rounded-xl border-2 border-dashed border-black/10 text-black/40 text-xs">
                <AlertCircle size={13} className="text-[#2C2DE0] shrink-0" />
                Ask your lecturer for a meeting code or join link.
              </div>
            ) : showCreate ? (
              <form onSubmit={handleCreate} className="space-y-2.5">
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Session title (e.g. OS — Chapter 4)"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#2C2DE0] text-black text-xs placeholder:text-black/30 focus:outline-none transition-colors"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={createForm.course}
                    onChange={(e) => setCreateForm((f) => ({ ...f, course: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border-2 border-black/10 text-black text-xs focus:outline-none focus:border-[#2C2DE0] transition-colors"
                  >
                    {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={createForm.roomType}
                    onChange={(e) => setCreateForm((f) => ({ ...f, roomType: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border-2 border-black/10 text-black text-xs focus:outline-none focus:border-[#2C2DE0] transition-colors"
                  >
                    {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isScheduled}
                    onChange={(e) => setCreateForm((f) => ({ ...f, isScheduled: e.target.checked }))}
                    className="accent-[#2C2DE0] w-3.5 h-3.5"
                  />
                  <span className="text-xs text-black/50">Schedule for later</span>
                </label>
                {createForm.isScheduled && (
                  <input
                    type="datetime-local"
                    required
                    value={createForm.scheduledAt}
                    onChange={(e) => setCreateForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black/10 text-black text-xs focus:outline-none focus:border-[#2C2DE0] transition-colors"
                  />
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full px-5 py-3 rounded-xl bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50"
                >
                  {creating ? "Creating…" : createForm.isScheduled ? "Schedule Meeting" : "🚀 Start Live Session"}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-black/30 text-xs">
                <Zap size={12} className="text-[#2C2DE0]" />
                Click Create to start or schedule a class.
              </div>
            )}
          </div>
        </div>

        {/* ══ LIVE MEETINGS ROW ══════════════════════════════════════════════ */}
        {liveMeetings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2C2DE0] animate-pulse" />
              <h2 className="text-black font-black text-sm uppercase tracking-wider">Happening Now</h2>
              <span className="text-xs text-black/30">({liveMeetings.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMeetings.map((m) => (
                <MeetingCard key={m._id} meeting={m} onJoin={goToRoom} onDetails={setDetailsMeeting} />
              ))}
            </div>
          </div>
        )}

        {/* ══ FILTERS + SEARCH ═══════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status tabs */}
          <div className="flex items-center gap-1 border-2 border-black/10 rounded-xl p-1 overflow-x-auto">
            {[
              { id: "all",      label: "All" },
              { id: "live",     label: "Live" },
              { id: "upcoming", label: "Upcoming" },
              { id: "ended",    label: "Ended" },
            ].map(({ id, label }) => (
              <button
key={id}
                onClick={() => setStatusFilter(id)}
                className={`
                  px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all
                  ${statusFilter === id
                    ? "bg-black text-white"
                    : "text-black/40 hover:text-black hover:bg-black/5"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, course, code, host…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#2C2DE0] text-black text-xs placeholder:text-black/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ══ MEETINGS GRID ══════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size={32} className="text-[#2C2DE0]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 border-2 border-dashed border-black/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center">
              <Video size={32} className="text-black/20" />
            </div>
            <div className="text-center">
              <p className="text-black font-bold">No meetings found</p>
              <p className="text-black/40 text-sm mt-1">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : statusFilter !== "all"
                    ? `No ${statusFilter} meetings`
                    : "No meetings scheduled yet."}
              </p>
            </div>
            {canCreate && (
              <button
onClick={() => setShowCreate(true)}
                className="px-5 py-3 rounded-xl bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all"
              >
                Create First Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MeetingCard key={m._id} meeting={m} onJoin={goToRoom} onDetails={setDetailsMeeting} />
            ))}
          </div>
        )}
      </div>

      {/* ══ DETAILS DRAWER ════════════════════════════════════════════════════ */}
      <MeetingDetailsDrawer
        meeting={detailsMeeting}
        onClose={() => setDetailsMeeting(null)}
        onJoin={(code) => { setDetailsMeeting(null); goToRoom(code); }}
      />
    </div>
  );
}
