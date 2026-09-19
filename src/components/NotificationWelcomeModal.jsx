// Frontend/src/components/NotificationWelcomeModal.jsx
// Firebase Notification Permission Welcome Modal
// Shows on first dashboard entry to ask for notification permissions

import { useState, useEffect } from "react";
import { X, Bell, MessageCircle, Users, Calendar, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { requestPushPermission } from "@/firebase/pushPermission";
import { useLanguage } from "@/hooks/useLanguage";

const STORAGE_KEY = "notification_welcome_dismissed";

export const NotificationWelcomeModal = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Show on first dashboard entry
    useEffect(() => {
        if (!user) return;

        const dismissed = localStorage.getItem(STORAGE_KEY);
        const hasPermission =
            typeof Notification !== "undefined" && Notification.permission === "granted";

        // Only show if: not dismissed AND no existing permission AND browser supports notifications
        if (!dismissed && !hasPermission && "Notification" in window && "serviceWorker" in navigator) {
            // Small delay to not overwhelm user on page load
            const timer = setTimeout(() => setOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleEnable = async () => {
        setLoading(true);
        try {
            const result = await requestPushPermission();
            if (result.ok) {
                localStorage.setItem(STORAGE_KEY, "true");
                setOpen(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLater = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setOpen(false);
    };

    const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
                    onClick={() => handleLater()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#2C2DE0] to-[#2C2DE0]/80 px-6 py-8 relative">
                            <button
                                onClick={() => handleLater()}
                                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Bell size={24} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-black text-white">
                                    Welcome, {firstName}! 👋
                                </h1>
                            </div>
                            <p className="text-white/80 text-sm">
                                Stay updated with important notifications
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                {t?.notification?.enableFor ?? "Would you like to receive notifications for:"}
                            </p>

                            <div className="space-y-3 mb-6">
                                {[
                                    {
                                        Icon: MessageCircle,
                                        label: t?.notification?.messages ?? "Messages",
                                    },
                                    {
                                        Icon: Users,
                                        label: t?.notification?.collaboration ?? "Collaboration updates",
                                    },
                                    {
                                        Icon: Volume2,
                                        label: t?.notification?.announcements ?? "Class announcements",
                                    },
                                    {
                                        Icon: Calendar,
                                        label: t?.notification?.meetings ?? "Meeting reminders",
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#2C2DE0]/20 flex items-center justify-center flex-shrink-0">
                                            <item.Icon size={14} className="text-[#2C2DE0]" />
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </span>
                                        <span className="ml-auto text-[#2C2DE0] text-lg">✓</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                                {t?.notification?.permissionInfo ??
                                    "You can change this anytime in settings"}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => handleLater()}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t?.notification?.later ?? "Later"}
                            </button>
                            <button
                                onClick={() => handleEnable()}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2C2DE0] hover:bg-[#2425bd] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Bell size={14} />
                                        {t?.notification?.enableButton ?? "Enable Notifications"}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationWelcomeModal;
