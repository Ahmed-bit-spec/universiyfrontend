import { io } from "socket.io-client";

// Prefer an explicit socket URL via env. Fallback to the backend origin
// derived from the API base URL (set on window.API_BASE_URL by api/client).
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? (typeof window !== 'undefined' && window.API_BASE_URL ? (() => {
  try {
    return new URL(window.API_BASE_URL).origin;
  } catch (e) {
    return undefined;
  }
})() : undefined);

const socketOptions = {
  path:            "/socket.io",
  withCredentials: true,
  transports:      ["websocket", "polling"],
  autoConnect:     true,
};

const socket = SOCKET_URL ? io(SOCKET_URL, socketOptions) : io(socketOptions);

export default socket;
