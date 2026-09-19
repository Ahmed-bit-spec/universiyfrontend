import api from "@/api/client";
import socket from "@/socket.js";

const BASE = "/meetings";

export const createMeeting = (body) => api.post(`${BASE}`, body).then((r) => r.data);
export const listMeetings = (params) => api.get(`${BASE}`, { params }).then((r) => r.data);
export const getActiveMeetings = () => api.get(`${BASE}/active`).then((r) => r.data);
export const getMyMeetings = () => api.get(`${BASE}/mine`).then((r) => r.data);
export const getMeetingByCode = (code) => api.get(`${BASE}/code/${code}`).then((r) => r.data);
export const joinMeeting = (code) => api.post(`${BASE}/code/${code}/join`).then((r) => r.data);
export const startMeeting = (id) => api.post(`${BASE}/${id}/start`).then((r) => r.data);
export const endMeeting = (id) => api.post(`${BASE}/${id}/end`).then((r) => r.data);
export const updateMeetingSettings = (id, body) => api.patch(`${BASE}/${id}/settings`, body).then((r) => r.data);
export const getMeetingMessages = (id) => api.get(`${BASE}/${id}/messages`).then((r) => r.data);
export const sendMeetingMessage = (id, message, type) =>
  api.post(`${BASE}/${id}/messages`, { message, type }).then((r) => r.data);

export const joinMeetingsLobby = () => {
  const emitLobby = () => socket.emit("meetings:join-lobby");
  if (socket.connected) {
    emitLobby();
  } else {
    socket.once("connect", emitLobby);
  }
};

export const onMeetingUpdated = (handler) => {
  socket.on("meeting:updated", handler);
  return () => socket.off("meeting:updated", handler);
};

export const onMeetingEnded = (handler) => {
  socket.on("meeting:ended", handler);
  return () => socket.off("meeting:ended", handler);
};

export const onMeetingChat = (handler) => {
  socket.on("meeting:chat", handler);
  return () => socket.off("meeting:chat", handler);
};

export default api;
