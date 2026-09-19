import React, { useState, useEffect } from "react";
import { ShieldCheck, MoreVertical, Search } from "lucide-react";
import {
    getGroupMembers,
    grantAnnouncementPermission,
    revokeAnnouncementPermission,
    addGroupAdmin,
    removeGroupAdmin,
    muteMember,
    unmuteMember,
    suspendMember,
    unsuspendMember,
    banMember,
    unbanMember,
    removeMember,
} from "@/api/groupApi";
import { Spinner } from "../ui";

const STATUS_BADGE = {
    muted: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
    suspended: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
    banned: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const MemberRow = ({ member, canManage, onAction, isActionLoading }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const u = member.user;
    const level = member.adminLevel;

    const handleActionWithClose = async (action, userId) => {
        setMenuOpen(false);
        await onAction(action, userId);
    };

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-3 relative">
            <img src={u?.photo || ""} alt={u?.name} className="w-10 h-10 rounded-full bg-[#2C2DE0]" />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-black dark:text-white text-sm flex items-center gap-1.5">
                    {u?.name}
                    {level === "group_admin" && <ShieldCheck size={13} className="text-[#2C2DE0]" />}
                    {level === "announcement_admin" && <ShieldCheck size={13} className="text-black/30 dark:text-white/30" />}
                </p>
                <p className="text-[11px] text-black/40 dark:text-white/40">
                    {u?.role} {u?.department ? `· ${u.department}` : ""} {u?.office ? `· ${u.office}` : ""}
                </p>
                <div className="flex gap-1 mt-1">
                    {level && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2C2DE0]/10 dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]">
                            {level === "group_admin" ? "Group Administrator" : "Announcement Admin"}
                        </span>
                    )}
                    {member.status !== "active" && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[member.status]}`}>
                            {member.status}
                        </span>
                    )}
                </div>
            </div>

            {canManage && (
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-9 z-10 w-56 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg py-1 text-sm">
                            {level !== "announcement_admin" && level !== "group_admin" && (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("grantAnnouncement", u._id)}>Grant announcement permission</MenuItem>
                            )}
                            {level === "announcement_admin" && (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("revokeAnnouncement", u._id)}>Revoke announcement permission</MenuItem>
                            )}
                            {level !== "group_admin" && <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("addGroupAdmin", u._id)}>Make group administrator</MenuItem>}
                            {level === "group_admin" && <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("removeGroupAdmin", u._id)}>Remove as group administrator</MenuItem>}
                            <Divider />
                            {member.status === "muted" ? (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("unmute", u._id)}>Unmute member</MenuItem>
                            ) : (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("mute", u._id)}>Mute member</MenuItem>
                            )}
                            {member.status === "suspended" ? (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("unsuspend", u._id)}>Unsuspend member</MenuItem>
                            ) : (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("suspend", u._id)}>Suspend member</MenuItem>
                            )}
                            {member.status === "banned" ? (
                                <MenuItem disabled={isActionLoading} onClick={() => handleActionWithClose("unban", u._id)}>Unban member</MenuItem>
                            ) : (
                                <MenuItem danger disabled={isActionLoading} onClick={() => handleActionWithClose("ban", u._id)}>Ban member</MenuItem>
                            )}
                            <Divider />
                            <MenuItem danger disabled={isActionLoading} onClick={() => handleActionWithClose("remove", u._id)}>Remove from group</MenuItem>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MenuItem = ({ children, onClick, danger, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none ${danger ? "text-red-600" : ""}`}
    >
        {children}
    </button>
);
const Divider = () => <div className="my-1 border-t border-black/5 dark:border-white/5" />;

const MembersTab = ({ groupId, canManage, onRefreshNeeded }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const load = async (q = "") => {
        setLoading(true);
        try {
            const res = await getGroupMembers(groupId, q);
            if (res.success) setMembers(res.members);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    useEffect(() => {
        const h = setTimeout(() => load(query), 300);
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const ACTIONS = {
        grantAnnouncement: grantAnnouncementPermission,
        revokeAnnouncement: revokeAnnouncementPermission,
        addGroupAdmin,
        removeGroupAdmin,
        mute: muteMember,
        unmute: unmuteMember,
        suspend: suspendMember,
        unsuspend: unsuspendMember,
        ban: banMember,
        unban: unbanMember,
        remove: removeMember,
    };

    const handleAction = async (action, userId) => {
        setActionLoading(true);
        try {
            await ACTIONS[action](groupId, userId);
            await load(query);
            onRefreshNeeded?.();
        } catch (err) {
            console.error("Member action failed:", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white focus:outline-none focus:border-[#2C2DE0]"
                />
            </div>

            <div className="space-y-2">
                {members.map((m) => (
                    <MemberRow key={m.user?._id} member={m} canManage={canManage} onAction={handleAction} isActionLoading={actionLoading} />
                ))}
            </div>
        </div>
    );
};

export default MembersTab;