import React, { useState, useEffect } from "react";
import { Inbox, CheckCircle2, Megaphone, Settings2, ScrollText, BarChart3 } from "lucide-react";
import {
    getPendingRequests,
    getResolvedRequests,
    approveRequest,
    rejectRequest,
    broadcastNotification,
    getModerationLog,
    getGroupReports,
} from "@/api/groupApi";
import { Spinner } from "../ui";

const BTN_PRIMARY =
    "bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none";

const SUBSECTIONS = [
    { key: "pending", label: "Pending Requests", icon: Inbox },
    { key: "resolved", label: "Resolved Requests", icon: CheckCircle2 },
    { key: "broadcast", label: "Broadcast Notifications", icon: Megaphone },
    { key: "moderation", label: "Moderation Log", icon: ScrollText },
    { key: "reports", label: "Reports", icon: BarChart3 },
];
// NOTE: "Announcements" management (post/pin/edit/delete) lives in the Messages tab itself for
// admins — duplicating that composer here would violate the spec's "no duplicate features" rule.
// "Group Settings" is covered by the editable fields in the Info tab (group_admin-gated there).
// "Member Management" and "Roles & Permissions" are covered by the Members tab's admin menu —
// listed as separate spec items but implemented as one coherent member-row action menu rather
// than a duplicate member list here.

/* ---------- Pending / Resolved requests ---------- */

const RequestCard = ({ request, resolved, onApprove, onReject }) => {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const [approving, setApproving] = useState(false);
    const [rejecting_action, setRejectingAction] = useState(false);

    return (
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
                <img src={request.studentId?.photo || ""} alt="" className="w-8 h-8 rounded-full bg-[#2C2DE0]" />
                <div>
                    <p className="font-bold text-sm text-black dark:text-white">{request.studentId?.name}</p>
                    <p className="text-[11px] text-black/40 dark:text-white/40">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
                {resolved && (
                    <span
                        className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${request.status === "approved"
                                ? "bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                            }`}
                    >
                        {request.status}
                    </span>
                )}
            </div>
            <p className="text-sm text-black/80 dark:text-white/80 whitespace-pre-wrap mb-3">{request.text}</p>

            {resolved && request.status === "rejected" && request.reviewNote && (
                <p className="text-xs text-red-600 mb-2">Reason: {request.reviewNote}</p>
            )}

            {!resolved && (
                rejecting ? (
                    <div className="space-y-2">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Rejection reason (shown to the student)"
                            rows={2}
                            disabled={rejecting_action}
                            className="w-full p-2 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none disabled:opacity-50"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejecting(false)}
                                disabled={rejecting_action}
                                className="px-3 py-1.5 rounded-lg text-sm font-bold text-black/60 dark:text-white/60 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!reason.trim()) return;
                                    setRejectingAction(true);
                                    try {
                                        await onReject(request._id, reason);
                                        setRejecting(false);
                                        setReason("");
                                    } finally {
                                        setRejectingAction(false);
                                    }
                                }}
                                disabled={!reason.trim() || rejecting_action}
                                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-600 text-white disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {rejecting_action ? "Rejecting..." : "Confirm rejection"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                setApproving(true);
                                try {
                                    await onApprove(request._id);
                                } finally {
                                    setApproving(false);
                                }
                            }}
                            disabled={approving || rejecting_action}
                            className={`px-3 py-1.5 rounded-lg ${BTN_PRIMARY}`}
                        >
                            {approving ? "Approving..." : "Approve"}
                        </button>
                        <button
                            onClick={() => setRejecting(true)}
                            disabled={approving}
                            className="px-3 py-1.5 rounded-lg text-sm font-bold text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            Reject
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

const RequestsPanel = ({ groupId, resolved }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = resolved ? await getResolvedRequests(groupId) : await getPendingRequests(groupId);
            if (res.success) setRequests(res.requests);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId, resolved]);

    if (loading) return <Spinner />;
    if (!requests.length) return <p className="text-sm text-black/40 dark:text-white/40 py-8 text-center">Nothing here</p>;

    return (
        <div className="space-y-3">
            {requests.map((r) => (
                <RequestCard
                    key={r._id}
                    request={r}
                    resolved={resolved}
                    onApprove={async (id) => { await approveRequest(groupId, id); load(); }}
                    onReject={async (id, reason) => { await rejectRequest(groupId, id, reason); load(); }}
                />
            ))}
        </div>
    );
};

/* ---------- Broadcast ---------- */

const BroadcastPanel = ({ groupId }) => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(null);

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) return;
        setSending(true);
        try {
            const res = await broadcastNotification(groupId, { title, body });
            if (res.success) {
                setSent(res.recipientCount);
                setTitle("");
                setBody("");
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-black/50 dark:text-white/50">
                Sends a website + Firebase push notification to every active member without posting an announcement message.
            </p>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full p-2 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none"
            />
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification body"
                rows={3}
                className="w-full p-2 rounded-lg text-sm bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none"
            />
            {sent !== null && <p className="text-xs text-[#2C2DE0]">Sent to {sent} members.</p>}
            <button onClick={handleSend} disabled={sending} className={`px-4 py-1.5 rounded-lg ${BTN_PRIMARY}`}>
                {sending ? "Sending..." : "Send broadcast"}
            </button>
        </div>
    );
};

/* ---------- Moderation Log ---------- */

const ModerationLogPanel = ({ groupId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getModerationLog(groupId)
            .then((res) => res.success && setLogs(res.logs))
            .finally(() => setLoading(false));
    }, [groupId]);

    if (loading) return <Spinner />;
    if (!logs.length) return <p className="text-sm text-black/40 dark:text-white/40 py-8 text-center">No actions recorded yet</p>;

    return (
        <div className="space-y-2">
            {logs.map((log) => (
                <div key={log._id} className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm">
                    <p className="text-black dark:text-white">
                        <span className="font-bold">{log.actorId?.name}</span> — {log.action.replace(/_/g, " ")}
                        {log.targetUserId && <> → <span className="font-bold">{log.targetUserId.name}</span></>}
                    </p>
                    <p className="text-[11px] text-black/40 dark:text-white/40 mt-1">
                        {new Date(log.createdAt).toLocaleString()} · {log.ip} · {log.device}
                    </p>
                </div>
            ))}
        </div>
    );
};

/* ---------- Reports ---------- */

const ReportsPanel = ({ groupId }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGroupReports(groupId)
            .then((res) => res.success && setReport(res.report))
            .finally(() => setLoading(false));
    }, [groupId]);

    if (loading) return <Spinner />;
    if (!report) return null;

    const cells = [
        ["Members", report.memberCount],
        ["Active", report.activeMembers],
        ["Muted / Suspended", report.mutedOrSuspended],
        ["Announcements", report.messageCount],
        ["Pending Requests", report.pendingRequests],
        ["Resolved Requests", report.resolvedRequests],
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cells.map(([label, value]) => (
                <div key={label} className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4">
                    <p className="text-2xl font-black text-black dark:text-white">{value}</p>
                    <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
                </div>
            ))}
        </div>
    );
};

/* ---------- Root ---------- */

const ManagementTab = ({ groupId }) => {
    const [active, setActive] = useState("pending");

    return (
        <div className="flex gap-6">
            <nav className="w-52 flex-shrink-0 space-y-1 hidden md:block">
                {SUBSECTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${active === key
                                ? "bg-[#2C2DE0] text-white shadow-[0_4px_0_#1E1FAA]"
                                : "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </nav>
            <div className="flex-1 min-w-0">
                {active === "pending" && <RequestsPanel groupId={groupId} resolved={false} />}
                {active === "resolved" && <RequestsPanel groupId={groupId} resolved={true} />}
                {active === "broadcast" && <BroadcastPanel groupId={groupId} />}
                {active === "moderation" && <ModerationLogPanel groupId={groupId} />}
                {active === "reports" && <ReportsPanel groupId={groupId} />}
            </div>
        </div>
    );
};

export default ManagementTab;