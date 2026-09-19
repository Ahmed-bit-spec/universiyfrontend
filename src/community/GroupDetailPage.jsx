import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Users, Shield, Info as InfoIcon, MoreVertical } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // ASSUMPTION — swap for your actual auth hook
import { getGroup } from "@/api/groupApi";
import { Spinner } from "./ui";
import MessagesTab from "./components/messageTab";
import MembersTab from "./components/memberTab";
import ManagementTab from "./components/management";
import InfoTab from "./components/infoTab";

// Colors intentionally unchanged from the original Duolingo palette — only structure/typography differ.
const TABS = [
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "members", label: "Members", icon: Users },
    { id: "management", label: "Management", icon: Shield }, // hidden below for non-group_admins
    { id: "info", label: "Info", icon: InfoIcon },
];

const GroupDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user?._id;
    const isUniversityAdmin = user?.role === "admin";

    const [group, setGroup] = useState(null);
    const [membership, setMembership] = useState(null);
    const [activeTab, setActiveTab] = useState("messages");
    const [loading, setLoading] = useState(true);

    const canManage = isUniversityAdmin || membership?.adminLevel === "group_admin";

    const loadGroup = async () => {
        try {
            const res = await getGroup(id);
            if (res.success) {
                setGroup(res.group);
                setMembership(res.membership);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadGroup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Management tab is only ever shown to Level 2 admins — never rendered for others,
    // matching "Only users with management permission can access this page."
    const visibleTabs = TABS.filter((t) => t.id !== "management" || canManage);

    if (loading) return <Spinner />;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-4">
                    ← Back
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-black dark:text-white mb-2">{group?.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-black/60 dark:text-white/60">
                            <p>👥 {group?.memberCount} Members</p>
                            {group?.semester && <p>📅 Semester {group.semester}</p>}
                            <p className="text-amber-600 dark:text-amber-400 font-bold">Official announcement channel</p>
                        </div>
                    </div>
                    <button className=" text-black text-sm font-bold  active:translate-y-1 active:shadow-none transition-all duration-150 group">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-6 border-b border-black/10 dark:border-white/10 overflow-x-auto">
                <div className="flex gap-1">
                    {visibleTabs.map(({ id: tabId, label, icon: Icon }) => (
                        <button 
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tabId
                                    ? "border-[#2C2DE0] text-[#2C2DE0]"
                                    : "border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {activeTab === "messages" && (
                    <MessagesTab
                        groupId={id}
                        group={group}
                        membership={membership}
                        currentUserId={currentUserId}
                        isUniversityAdmin={isUniversityAdmin}
                    />
                )}
                {activeTab === "members" && (
                    <MembersTab groupId={id} canManage={canManage} onRefreshNeeded={loadGroup} />
                )}
                {activeTab === "management" && canManage && <ManagementTab groupId={id} />}
                {activeTab === "info" && (
                    <InfoTab group={group} canManage={canManage} onSaved={(g) => setGroup(g)} />
                )}
            </div>
        </div>
    );
};

export default GroupDetailPage;