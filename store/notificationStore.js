// client/store/notificationStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Zustand store — single source of truth for the notification system.
//
// Features:
//   • Optimistic updates (mark read, dismiss) for snappy UX
//   • Pagination + infinite scroll
//   • Socket event integration
//   • Per-filter caching (cache invalidated on new notification)
// ─────────────────────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

const PAGE_LIMIT = 20;

export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      notifications:  [],
      unreadCount:    0,
      pagination:     { page: 1, hasMore: false, total: 0 },
      activeFilter:   "all",
      loading:        false,
      loadingMore:    false,
      error:          null,

      // ── Fetch (replaces list) ────────────────────────────────────────────
      fetchNotifications: async (filter = get().activeFilter, reset = true) => {
        if (reset) {
          set({ loading: true, error: null, activeFilter: filter });
        } else {
          set({ loadingMore: true });
        }

        try {
          const page = reset ? 1 : get().pagination.page + 1;
          const params = {
            page,
            limit: PAGE_LIMIT,
            ...(filter !== "all" && { type: filter }),
          };

          const { data } = await axios.get("/api/notifications", { params });

          set((state) => ({
            notifications: reset
              ? data.notifications
              : [...state.notifications, ...data.notifications],
            unreadCount: data.unreadCount,
            pagination: {
              page:    data.pagination.page,
              hasMore: data.pagination.hasMore,
              total:   data.pagination.total,
            },
            loading:     false,
            loadingMore: false,
          }));
        } catch (err) {
          set({
            loading:     false,
            loadingMore: false,
            error:       err.response?.data?.message || "Failed to load notifications",
          });
        }
      },

      // ── Load more (append) ──────────────────────────────────────────────
      loadMore: () => get().fetchNotifications(get().activeFilter, false),

      // ── Change filter ───────────────────────────────────────────────────
      changeFilter: (filter) => get().fetchNotifications(filter, true),

      // ── Fetch unread count only ─────────────────────────────────────────
      fetchUnreadCount: async () => {
        try {
          const { data } = await axios.get("/api/notifications/unread-count");
          set({ unreadCount: data.count });
        } catch (_) {}
      },

      // ── Mark single as read (optimistic) ───────────────────────────────
      markAsRead: async (deliveryId) => {
        // Optimistic
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.deliveryId === deliveryId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        try {
          await axios.patch(`/api/notifications/${deliveryId}/read`);
        } catch (_) {
          // Rollback
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.deliveryId === deliveryId ? { ...n, isRead: false } : n
            ),
            unreadCount: state.unreadCount + 1,
          }));
        }
      },

      // ── Mark single as unread (optimistic) ─────────────────────────────
      markAsUnread: async (deliveryId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.deliveryId === deliveryId ? { ...n, isRead: false } : n
          ),
          unreadCount: state.unreadCount + 1,
        }));

        try {
          await axios.patch(`/api/notifications/${deliveryId}/unread`);
        } catch (_) {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.deliveryId === deliveryId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        }
      },

      // ── Mark all as read ────────────────────────────────────────────────
      markAllAsRead: async () => {
        const prev = get().notifications;
        const prevCount = get().unreadCount;

        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));

        try {
          await axios.patch("/api/notifications/read-all");
        } catch (_) {
          set({ notifications: prev, unreadCount: prevCount });
        }
      },

      // ── Dismiss single (optimistic) ─────────────────────────────────────
      dismiss: async (deliveryId) => {
        const wasUnread = get().notifications.find(
          (n) => n.deliveryId === deliveryId && !n.isRead
        );

        set((state) => ({
          notifications: state.notifications.filter((n) => n.deliveryId !== deliveryId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1),
          },
        }));

        try {
          await axios.delete(`/api/notifications/${deliveryId}`);
        } catch (_) {
          get().fetchNotifications();
        }
      },

      // ── Clear all ───────────────────────────────────────────────────────
      clearAll: async () => {
        const prev = get().notifications;
        set({ notifications: [], unreadCount: 0, pagination: { page: 1, hasMore: false, total: 0 } });
        try {
          await axios.delete("/api/notifications/clear-all");
        } catch (_) {
          set({ notifications: prev });
          get().fetchUnreadCount();
        }
      },

      // ── Bulk action ─────────────────────────────────────────────────────
      bulkAction: async (deliveryIds, action) => {
        set((state) => {
          let unreadDelta = 0;
          const notifications = state.notifications.map((n) => {
            if (!deliveryIds.includes(n.deliveryId)) return n;
            if (action === "read"    && !n.isRead) { unreadDelta--; return { ...n, isRead: true };  }
            if (action === "unread"  &&  n.isRead) { unreadDelta++; return { ...n, isRead: false }; }
            return n;
          }).filter((n) => action !== "dismiss" || !deliveryIds.includes(n.deliveryId));

          return {
            notifications,
            unreadCount: Math.max(0, state.unreadCount + unreadDelta),
          };
        });

        try {
          await axios.patch("/api/notifications/bulk", { deliveryIds, action });
        } catch (_) {
          get().fetchNotifications();
        }
      },

      // ── Socket: incoming new notification ──────────────────────────────
      onSocketNotification: (payload) => {
        set((state) => {
          // Avoid duplicates
          const exists = state.notifications.some(
            (n) => n.deliveryId === payload.deliveryId
          );
          if (exists) return state;

          const shaped = {
            deliveryId:     payload.deliveryId,
            notificationId: payload.notificationId,
            titleKey:       payload.titleKey,
            messageKey:     payload.messageKey,
            titleParams:    payload.titleParams  || {},
            messageParams:  payload.messageParams || {},
            type:           payload.type,
            actionUrl:      payload.actionUrl,
            isRead:         false,
            createdAt:      payload.createdAt || new Date().toISOString(),
          };

          // Only prepend if current filter matches or is "all"
          const filter = state.activeFilter;
          const shouldShow = filter === "all" || filter === payload.type;

          return {
            notifications:  shouldShow ? [shaped, ...state.notifications] : state.notifications,
            unreadCount:    state.unreadCount + 1,
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          };
        });
      },

      // ── Socket: server pushes updated unread count ──────────────────────
      onSocketUnreadCount: ({ count }) => {
        set({ unreadCount: count });
      },

      // ── Toast queue (managed by NotificationProvider) ───────────────────
      toastQueue: [],
      enqueueToast: (payload) => {
        set((state) => ({ toastQueue: [...state.toastQueue, payload] }));
      },
      dequeueToast: () => {
        set((state) => ({ toastQueue: state.toastQueue.slice(1) }));
      },
    }),
    { name: "NotificationStore" }
  )
);