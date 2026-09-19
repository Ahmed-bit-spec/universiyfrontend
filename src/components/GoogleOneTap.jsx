/**
 * GoogleOneTap.jsx
 * Renders Google One Tap sign-in UI.
 * On credential received → POST /auth/google-one-tap → sets cookie → calls login().
 *
 * Usage:
 *   <GoogleOneTap />   (anywhere inside <AuthProvider>)
 */
import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleOneTap() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const initialized = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response) => {
      const token = response.credential;
      if (!token) return;

      try {
        const { data } = await api.post(
          "/auth/google-one-tap",
          { credential: token, clientId: GOOGLE_CLIENT_ID },
          { withCredentials: true }
        );

        const userData = data?.data?.user ?? data?.user;
        if (!userData) throw new Error("No user in response");

        login(userData);
        toast.success("Welcome back!");

        if (userData.role === "admin") navigate("/admin/dashboard");
        else navigate("/dashboard");
      } catch (err) {
        const msg = err?.response?.data?.message || "Google sign-in failed.";
        toast.error(msg);
        console.error("[GoogleOneTap] error:", err);
      }
    },
    [login, navigate]
  );

  useEffect(() => {
    // Don't show One Tap if user is already logged in
    if (user || initialized.current) return;
    if (!GOOGLE_CLIENT_ID) {
      console.warn("[GoogleOneTap] VITE_GOOGLE_CLIENT_ID not set. One Tap disabled.");
      return;
    }

    const initOneTap = () => {
      if (!window.google?.accounts?.id) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.info(
            "[GoogleOneTap] prompt not shown:",
            notification.getNotDisplayedReason?.() ||
            notification.getSkippedReason?.()
          );
        }
      });
    };

    // Load the GSI script if not already present
    if (window.google?.accounts?.id) {
      initOneTap();
    } else {
      const existing = document.getElementById("gsi-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initOneTap;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", initOneTap);
      }
    }

    return () => {
      // Cancel the prompt when unmounting
      try {
        window.google?.accounts?.id?.cancel();
      } catch (_) { }
    };
  }, [user, handleCredentialResponse]);

  // This component renders no visible DOM — One Tap is a native Google popup
  return null;
}
