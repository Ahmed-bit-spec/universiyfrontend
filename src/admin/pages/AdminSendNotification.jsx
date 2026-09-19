// client/pages/admin/AdminNotificationsPage.jsx
import { useState } from "react";
import {
  Bell, Plus, Trash2, Edit2, Send, Clock,
  Users, User, Globe, X, ChevronDown,
  Calendar, BookOpen, Settings, AlertTriangle, Megaphone,
  Search, RefreshCw, BarChart2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";

const TYPES = [
  { value: "announcement",        label: "Announcement",  Icon: Megaphone     },
  { value: "system",              label: "System",        Icon: Settings      },
  { value: "warning",             label: "Warning",       Icon: AlertTriangle },
  { value: "reservation_created", label: "Reservation",   Icon: Calendar      },
  { value: "book_due_soon",       label: "Book",          Icon: BookOpen      },
];

const RECIPIENT_TYPES = [
  { value: "all",            label: "Everyone",          Icon: Globe  },
  { value: "user",           label: "All Students",      Icon: Users  },
  { value: "admin",          label: "All Admins",        Icon: Users  },
  { value: "both",           label: "Students + Admins", Icon: Users  },
  { value: "specific_users", label: "Specific Users",    Icon: User   },
];

const STATUS_BADGE = {
  sent:      "bg-transparent text-[#2C2DE0] dark:text-[#2C2DE0] border-gray-200 dark:border-white/10",
  scheduled: "bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10",
  draft:     "bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10",
  failed:    "bg-transparent text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
};

const BLANK = {
  titleKey:      "",
  messageKey:    "",
  titleParams:   "{}",
  messageParams: "{}",
  type:          "announcement",
  recipientType: "all",
  specificUsers: "",
  actionUrl:     "",
  scheduledAt:   "",
};

// ── Form modal ────────────────────────────────────────────────────────────────
const NotifForm = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.titleKey.trim() || !form.messageKey.trim()) {
      toast.error("Title key and message key are required");
      return;
    }
    let titleParams, messageParams;
    try {
      titleParams   = JSON.parse(form.titleParams   || "{}");
      messageParams = JSON.parse(form.messageParams || "{}");
    } catch {
      toast.error("Invalid JSON in parameters");
      return;
    }

    const payload = {
      titleKey:      form.titleKey.trim(),
      messageKey:    form.messageKey.trim(),
      titleParams,
      messageParams,
      type:          form.type,
      recipientType: form.recipientType,
      actionUrl:     form.actionUrl.trim() || null,
      scheduledAt:   form.scheduledAt || null,
    };

    if (form.recipientType === "specific_users") {
      payload.specificRecipients = form.specificUsers
        .split(",").map((s) => s.trim()).filter(Boolean);
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {initial ? "Edit Notification" : "Create Notification"}
          </p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ value, label, Icon }) => (
                <button key={value} onClick={() => set("type", value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
                    form.type === value
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                  }`}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Send To</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RECIPIENT_TYPES.map(({ value, label, Icon }) => (
                <button key={value} onClick={() => set("recipientType", value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${
                    form.recipientType === value
                      ? "bg-[#2C2DE0] border-[#2C2DE0] text-white shadow-sm"
                      : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#2C2DE0]"
                  }`}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
          </div>

          {form.recipientType === "specific_users" && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">
                User IDs <span className="normal-case font-normal">(comma-separated)</span>
              </label>
              <textarea value={form.specificUsers} onChange={(e) => set("specificUsers", e.target.value)}
                placeholder="507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012"
                rows={2}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2C2DE0] transition-colors resize-none font-mono"
              />
            </div>
          )}

          {[
            { key: "titleKey",      label: "Title Key",      placeholder: "notification.reservationCreated.title"   },
            { key: "messageKey",    label: "Message Key",    placeholder: "notification.reservationCreated.message" },
            { key: "titleParams",   label: "Title Params",   placeholder: '{"minutesLeft": 15}',  suffix: "(JSON)" },
            { key: "messageParams", label: "Message Params", placeholder: '{"seatNumber": "A-12"}', suffix: "(JSON)" },
            { key: "actionUrl",     label: "Action URL",     placeholder: "/my-reservations or /books/123", suffix: "(optional)" },
          ].map(({ key, label, placeholder, suffix }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">
                {label} {suffix && <span className="normal-case font-normal">{suffix}</span>}
              </label>
              <input value={form[key]} onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2C2DE0] transition-colors font-mono"
              />
            </div>
          ))}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">
              Schedule For <span className="normal-case font-normal">(leave blank to send now)</span>
            </label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#2C2DE0] transition-colors"
            />
          </div>

          {(form.titleKey || form.messageKey) && (
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Preview (raw keys)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{form.titleKey}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.messageKey}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2C2DE0] hover:bg-[#2C2DE0] transition-all text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
              {form.scheduledAt ? <><Clock size={14} />Schedule</> : <><Send size={14} />Send Now</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminNotificationsPage = () => {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const n  = t?.notification?.admin ?? {};

  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [expanded, setExpanded]         = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminNotifications", search, typeFilter, statusFilter],
    queryFn: async () => {
      const params = { limit: 50 };
      if (search)             params.search = search;
      if (typeFilter   !== "all") params.type   = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await apiClient.get("/notifications/admin/all", { params });
      return data;
    },
    staleTime: 30_000,
  });

  const sendMutation = useMutation({
    mutationFn: (payload) => apiClient.post("/notifications/admin/send", payload),
    onSuccess: () => {
      toast.success(t?.notification?.sendSuccess ?? "Notification sent");
      qc.invalidateQueries(["adminNotifications"]);
      setShowForm(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, payload }) => apiClient.put(`/notifications/admin/${id}`, payload),
    onSuccess: () => {
      toast.success("Notification updated");
      qc.invalidateQueries(["adminNotifications"]);
      setEditing(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/notifications/admin/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries(["adminNotifications"]);
    },
    onError: () => toast.error("Delete failed"),
  });

  const handleSave = (payload) => {
    if (editing) editMutation.mutate({ id: editing._id, payload });
    else sendMutation.mutate(payload);
  };

  const notifications = data?.notifications ?? [];

  const totalSent      = notifications.filter((n) => n.status === "sent").length;
  const totalScheduled = notifications.filter((n) => n.status === "scheduled").length;
  const avgReadRate    = notifications.length
    ? Math.round(
        notifications.reduce((acc, n) => {
          const total = n.deliveryStats?.total || 0;
          const read  = n.deliveryStats?.readCount || 0;
          return acc + (total ? read / total : 0);
        }, 0) / notifications.length * 100
      )
    : 0;

  return (
    // ✅ Full width — no max-w constraint, uses all space left by sidebar
    <div className="w-full px-6 py-6 pb-20">

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {n.pageTitle ?? "Notification Management"}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {n.pageSubtitle ?? "Create, schedule, and monitor notifications"}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2C2DE0] hover:bg-[#2C2DE0] transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none"
        >
          <Plus size={15} />{n.create ?? "Create Notification"}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: n.totalSent ?? "Total Sent",    value: totalSent,         Icon: Send      },
          { label: n.scheduled ?? "Scheduled",     value: totalScheduled,    Icon: Clock     },
          { label: n.readRate  ?? "Avg Read Rate", value: `${avgReadRate}%`, Icon: BarChart2 },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-white/5 px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center">
                <Icon size={13} className="text-[#2C2DE0]" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by key…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2C2DE0] transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#2C2DE0] transition-colors"
        >
          <option value="all">All Types</option>
          {TYPES.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#2C2DE0] transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
        <button
          onClick={() => refetch()}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#2C2DE0] hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0]/50 transition-all"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <span>Title Key</span>
          <span>Message Key</span>
          <span>Type</span>
          <span>Status</span>
          <span>Delivery</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading && (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="h-4 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="py-16 flex flex-col items-center text-center">
            <Bell size={24} className="text-gray-300 dark:text-white/20 mb-3" />
            <p className="font-bold text-gray-900 dark:text-white text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first notification above</p>
          </div>
        )}

        {!isLoading && notifications.map((notif) => {
          const stats    = notif.deliveryStats ?? {};
          const readRate = stats.total ? Math.round(stats.readCount / stats.total * 100) : 0;
          const isExpanded = expanded === notif._id;

          return (
            <div key={notif._id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-200 truncate">{notif.titleKey}</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{notif.messageKey}</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 capitalize whitespace-nowrap">
                  {notif.type.replace(/_/g, " ")}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border capitalize whitespace-nowrap ${STATUS_BADGE[notif.status] ?? ""}`}>
                  {notif.status}
                </span>
                <button
                  onClick={() => setExpanded(isExpanded ? null : notif._id)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#2C2DE0] transition-colors whitespace-nowrap"
                >
                  <BarChart2 size={12} />
                  {stats.readCount ?? 0}/{stats.total ?? 0}
                  <ChevronDown size={11} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <div className="flex items-center gap-1 justify-end">
                  {notif.status !== "sent" && (
                    <button
                      onClick={() => { setEditing(notif); setShowForm(true); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#2C2DE0] hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/10 transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(notif._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-4 bg-gray-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-white/5 flex-wrap">
                    {[
                      { label: "Delivered", value: stats.total ?? 0,      cls: "text-gray-900 dark:text-white" },
                      { label: "Read",      value: stats.readCount ?? 0,  cls: "text-[#2C2DE0]"               },
                      { label: "Read Rate", value: `${readRate}%`,        cls: "text-gray-900 dark:text-white" },
                    ].map(({ label, value, cls }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                        <p className={`text-lg font-black mt-0.5 ${cls}`}>{value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recipients</p>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1 capitalize">
                        {notif.recipientType?.replace(/_/g, " ")}
                      </p>
                    </div>
                    {notif.scheduledAt && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scheduled</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1">
                          {format(new Date(notif.scheduledAt), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    )}
                  </div>
                  {(stats.total ?? 0) > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#2C2DE0] rounded-full transition-all" style={{ width: `${readRate}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <NotifForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminNotificationsPage;