/* global importScripts, firebase */

// FCM service worker for background notifications.
// Uses Firebase Messaging Compat SDK (v10) from CDN.
// This file lives in /public so it is served at "/firebase-messaging-sw.js".

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

let messagingInitialized = false;

const init = async () => {
  if (messagingInitialized) return;

  try {
    // Try to fetch config from backend API first
    let cfg = null;

    try {
      const res = await fetch("/api/v1/auth/firebase-config", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        cfg = data?.config;
      }
    } catch (fetchErr) {
      console.warn("[FCM SW] Could not fetch firebase-config from API:", fetchErr.message);
    }

    // Validate config has required keys
    if (!cfg?.apiKey || !cfg?.projectId || !cfg?.messagingSenderId || !cfg?.appId) {
      console.warn("[FCM SW] Firebase config missing required keys — cannot initialize messaging.");
      return;
    }

    // Avoid double-initialization
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
    }

    const messaging = firebase.messaging();
    messagingInitialized = true;
    console.log("[FCM SW] Firebase Messaging initialized for project:", cfg.projectId);

    // Show notifications when app is in the background / closed.
    messaging.onBackgroundMessage((payload) => {
      console.log("[FCM SW] Background message received:", payload);

      const title = payload?.notification?.title || payload?.data?.title || "UniCore Notification";
      const body  = payload?.notification?.body  || payload?.data?.body  || "";
      const url   = payload?.data?.url || "/notifications";

      self.registration.showNotification(title, {
        body,
        icon:  "/favicon.ico",
        badge: "/favicon.ico",
        data:  { url },
        actions: [
          { action: "open", title: "Open" },
          { action: "dismiss", title: "Dismiss" },
        ],
      });
    });
  } catch (err) {
    console.error("[FCM SW] Initialization error:", err);
  }
};

// Initialize immediately and also re-try on activate
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim().then(() => init()));
});

init();

// ── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Handle action buttons
  if (event.action === "dismiss") return;

  const urlToOpen = new URL(
    event.notification?.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if already open at that URL
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Navigate an existing window to the URL
        if (windowClients.length > 0 && "navigate" in windowClients[0] && "focus" in windowClients[0]) {
          return windowClients[0].navigate(urlToOpen).then((c) => c?.focus());
        }
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((err) => {
        console.error("[FCM SW] Notification click handler error:", err);
      })
  );
});
