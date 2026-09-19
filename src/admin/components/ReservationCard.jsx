import React, { useState } from "react";
import { Calendar, User, BookOpen, Clock, Tag, CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";

const ReservationCard = ({
    reservation,
    onApprove,
    onReject,
    onMarkBorrowed,
    onMarkReturned,
    onCancel,
    isAdmin = false
}) => {
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            active: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            approved: "bg-[#2C2DE0]/10 text-[#2C2DE0] dark:bg-[#2C2DE0]/20 dark:text-[#2C2DE0]",
            borrowed: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
            returned: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
            cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
            expired: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "approved":
            case "borrowed":
                return <CheckCircle className="w-4 h-4" />;
            case "rejected":
            case "cancelled":
                return <XCircle className="w-4 h-4" />;
            case "expired":
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const handleAction = async (action, params = {}) => {
        setActionLoading(prev => ({ ...prev, [action]: true }));
        try {
            const endpoint = isAdmin
                ? `/api/admin/book-reservations/${reservation.id}/${action}`
                : `/api/books/reservations/${reservation.id}/${action}`;

            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(params),
            });

            if (!response.ok) throw new Error("Action failed");

            const data = await response.json();

            switch (action) {
                case "approve":
                    onApprove?.(data.reservation);
                    break;
                case "reject":
                    onReject?.(data.reservation);
                    break;
                case "mark-borrowed":
                    onMarkBorrowed?.(data.reservation);
                    break;
                case "mark-returned":
                    onMarkReturned?.(data.reservation);
                    break;
                case "cancel":
                    onCancel?.(data.reservation);
                    break;
            }
        } catch (error) {
            console.error(`${action} failed:`, error);
        } finally {
            setActionLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} overflow-hidden shadow-sm hover:shadow-md transition`}>
            {/* Header with Status */}
            <div className={`px-6 py-4 border-b flex justify-between items-start ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                        {reservation.book}
                    </h3>
                    {reservation.author && (
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {t("by")} {reservation.author}
                        </p>
                    )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    {t(reservation.status)}
                </div>
            </div>

            {/* Student Information */}
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <User className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        <div>
                            <p className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-600"} tracking-wide`}>
                                {t("Student")}
                            </p>
                            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {reservation.studentFullName || reservation.student}
                            </p>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                ID: {reservation.studentId}
                            </p>
                        </div>
                    </div>

                    {reservation.department && (
                        <div>
                            <p className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-600"} tracking-wide`}>
                                {t("Department")}
                            </p>
                            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {reservation.department}
                            </p>
                            {reservation.semester && (
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {t("Semester")} {reservation.semester}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reservation Details */}
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        <div>
                            <p className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                {t("Reserved")}
                            </p>
                            <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                                {formatDate(reservation.reservedAt)}
                            </p>
                        </div>
                    </div>

                    {reservation.dueDate && (
                        <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                            <div>
                                <p className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {t("Due Date")}
                                </p>
                                <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                                    {formatDate(reservation.dueDate)}
                                </p>
                            </div>
                        </div>
                    )}

                    {reservation.qrCode && (
                        <div className="flex items-center gap-2">
                            <Tag className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                            <div>
                                <p className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {t("QR Code")}
                                </p>
                                <p className={`text-xs font-mono ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                                    {reservation.qrCode.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
                <div className={`px-6 py-4 ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                    <p className={`text-xs uppercase font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {t("Actions")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {reservation.status === "pending" && (
                            <>
                                <button
                                    onClick={() => handleAction("approve")}
                                    disabled={actionLoading.approve}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#2C2DE0] text-white text-sm font-medium hover:bg-[#2C2DE0] disabled:opacity-50 transition"
                                >
                                    {actionLoading.approve && <Loader className="w-4 h-4 animate-spin" />}
                                    {t("Approve")}
                                </button>
                                <button
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading.reject}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                                >
                                    {actionLoading.reject && <Loader className="w-4 h-4 animate-spin" />}
                                    {t("Reject")}
                                </button>
                            </>
                        )}

                        {reservation.status === "active" && (
                            <>
                                <button
                                    onClick={() => handleAction("mark-borrowed")}
                                    disabled={actionLoading["mark-borrowed"]}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {actionLoading["mark-borrowed"] && <Loader className="w-4 h-4 animate-spin" />}
                                    {t("Mark Borrowed")}
                                </button>
                            </>
                        )}

                        {reservation.status === "borrowed" && (
                            <>
                                <button
                                    onClick={() => handleAction("mark-returned")}
                                    disabled={actionLoading["mark-returned"]}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                                >
                                    {actionLoading["mark-returned"] && <Loader className="w-4 h-4 animate-spin" />}
                                    {t("Mark Returned")}
                                </button>
                            </>
                        )}

                        {["pending", "active"].includes(reservation.status) && (
                            <button
                                onClick={() => handleAction("cancel")}
                                disabled={actionLoading.cancel}
                                className="flex items-center gap-2 px-3 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition"
                            >
                                {actionLoading.cancel && <Loader className="w-4 h-4 animate-spin" />}
                                {t("Cancel")}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* User View Actions */}
            {!isAdmin && ["pending", "active"].includes(reservation.status) && (
                <div className={`px-6 py-4 ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                    <button
                        onClick={() => handleAction("cancel")}
                        disabled={actionLoading.cancel}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                    >
                        {actionLoading.cancel && <Loader className="w-4 h-4 animate-spin" />}
                        {t("Cancel Reservation")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReservationCard;
