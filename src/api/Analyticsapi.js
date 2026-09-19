import api from "@/api/client";

export const fetchAnalyticsOverview = () => api.get("/api/v1/admin/analytics/overview");
export const fetchAnalyticsReservations = (period = "30d") => api.get("/api/v1/admin/analytics/reservations", { params: { period } });
export const fetchAnalyticsStudents = () => api.get("/api/v1/admin/analytics/students");
export const fetchAnalyticsBooks = () => api.get("/api/v1/admin/analytics/books");
export const fetchAnalyticsBorrowing = () => api.get("/api/v1/admin/analytics/borrowing");
export const fetchAnalyticsLibraryUsage = () => api.get("/api/v1/admin/analytics/library-usage");