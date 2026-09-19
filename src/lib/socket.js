// Re-export the single app-wide socket instance (avoids duplicate io() clients).
import socket from "../socket.js";
export default socket;
