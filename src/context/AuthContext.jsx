import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "@/api/client";

const AuthContext = createContext();

// Your /auth/me response returns `id`, but the rest of the app (PostCard,
// Feed, UserDetailsPage, socket event matching, etc.) all compare against
// `user._id` (the Mongo convention). Rather than hunt down every `_id`
// reference across the app, normalize once here so both keys always work.
const normalizeUser = (u) => {
  if (!u) return u;
  return { ...u, _id: u._id ?? u.id };
};

const fetchCurrentUser = async () => {
  const { data } = await api.get("/auth/me", { withCredentials: true });
  return normalizeUser(data.data || data.user);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        console.log("[AuthContext] checking /auth/me with credentials");
        const userObj = await fetchCurrentUser();
        if (cancelled) return;
        console.log("[AuthContext] auth check success", userObj);
        setUser(userObj);
      } catch (err) {
        // Access token may be expired — refresh cookie should restore the session
        // without forcing the user to log in again on every page reload.
        if (err?.response?.status === 401) {
          try {
            console.log("[AuthContext] session expired, trying refresh cookie");
            const { data } = await api.post("/auth/refresh-token", {}, { withCredentials: true });
            const newToken = data?.data?.accessToken || data?.accessToken;
            if (newToken) setAccessToken(newToken);

            const userObj = await fetchCurrentUser();
            if (cancelled) return;
            console.log("[AuthContext] refresh success", userObj);
            setUser(userObj);
            return;
          } catch (refreshErr) {
            console.error(
              "[AuthContext] refresh failed",
              refreshErr?.response?.status,
              refreshErr?.message
            );
          }
        } else {
          console.error("[AuthContext] auth check failed", err?.response?.status, err?.message);
        }

        if (cancelled) return;

        // If no server session, allow a persisted guest session (from Enter as Guest)
        const guestRaw = localStorage.getItem("guestUser");
        if (guestRaw) {
          try {
            const guestObj = normalizeUser(JSON.parse(guestRaw));
            console.log("[AuthContext] restoring guest session", guestObj);
            setUser(guestObj);
          } catch {
            console.warn("[AuthContext] invalid guestUser in localStorage, clearing");
            localStorage.removeItem("guestUser");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData) => {
    // clear any guest marker when a real user logs in
    localStorage.removeItem("guestUser");
    setUser(normalizeUser(userData));
  };

  const logout = async () => {
    // clear guest marker too
    localStorage.removeItem("guestUser");
    setAccessToken(null);
    setUser(null);
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateUser = (userData) => {
    if (!userData) return;
    // Merge with existing user so partial profile updates (photo/name) keep other fields
    setUser((prev) => normalizeUser(prev ? { ...prev, ...userData } : userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
