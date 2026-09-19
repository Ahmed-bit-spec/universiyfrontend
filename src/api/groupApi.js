import api from "@/api/client";

const BASE = "/groups";

/* Sidebar / discovery */
export const getMyGroups = () => api.get(`${BASE}/mine`).then((r) => r.data);
export const getGroup = (id) => api.get(`${BASE}/${id}`).then((r) => r.data);
export const searchGroups = (q) => api.get(`${BASE}/search`, { params: { q } }).then((r) => r.data);
export const getGroupMembers = (groupId, q = "") =>
  api.get(`${BASE}/${groupId}/members`, { params: { q } }).then((r) => r.data);
export const updateGroupInfo = (groupId, payload) => api.patch(`${BASE}/${groupId}`, payload).then((r) => r.data);

/* Messages tab */
export const getGroupMessages = (groupId, page = 1, limit = 20) =>
  api.get(`${BASE}/${groupId}/messages`, { params: { page, limit } }).then((r) => r.data);
export const sendMessage = (groupId, payload) => api.post(`${BASE}/${groupId}/messages`, payload).then((r) => r.data);
export const pinMessage = (groupId, messageId) =>
  api.patch(`${BASE}/${groupId}/messages/${messageId}/pin`).then((r) => r.data);
export const editMessage = (groupId, messageId, payload) =>
  api.patch(`${BASE}/${groupId}/messages/${messageId}`, payload).then((r) => r.data);
export const deleteMessage = (groupId, messageId) =>
  api.delete(`${BASE}/${groupId}/messages/${messageId}`).then((r) => r.data);
export const markMessageSeen = (groupId, messageId) =>
  api.post(`${BASE}/${groupId}/messages/${messageId}/seen`).then((r) => r.data);
export const likeMessage = (groupId, messageId) =>
  api.post(`${BASE}/${groupId}/messages/${messageId}/like`).then((r) => r.data);
export const unlikeMessage = (groupId, messageId) =>
  api.post(`${BASE}/${groupId}/messages/${messageId}/unlike`).then((r) => r.data);

/* Student message requests */
export const submitMessageRequest = (groupId, payload) =>
  api.post(`${BASE}/${groupId}/requests`, payload).then((r) => r.data);
export const getMyRequests = (groupId) => api.get(`${BASE}/${groupId}/requests/mine`).then((r) => r.data);

/* Management tab (group_admin only — server re-validates regardless) */
export const getPendingRequests = (groupId) =>
  api.get(`${BASE}/${groupId}/management/requests/pending`).then((r) => r.data);
export const getResolvedRequests = (groupId) =>
  api.get(`${BASE}/${groupId}/management/requests/resolved`).then((r) => r.data);
export const approveRequest = (groupId, requestId) =>
  api.post(`${BASE}/${groupId}/management/requests/${requestId}/approve`).then((r) => r.data);
export const rejectRequest = (groupId, requestId, reason) =>
  api.post(`${BASE}/${groupId}/management/requests/${requestId}/reject`, { reason }).then((r) => r.data);

export const grantAnnouncementPermission = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/permissions/${userId}/announcement/grant`).then((r) => r.data);
export const revokeAnnouncementPermission = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/permissions/${userId}/announcement/revoke`).then((r) => r.data);
export const addGroupAdmin = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/permissions/${userId}/group-admin/add`).then((r) => r.data);
export const removeGroupAdmin = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/permissions/${userId}/group-admin/remove`).then((r) => r.data);

export const muteMember = (groupId, userId, mutedUntil) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/mute`, { mutedUntil }).then((r) => r.data);
export const unmuteMember = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/unmute`).then((r) => r.data);
export const suspendMember = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/suspend`).then((r) => r.data);
export const unsuspendMember = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/unsuspend`).then((r) => r.data);
export const banMember = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/ban`).then((r) => r.data);
export const unbanMember = (groupId, userId) =>
  api.post(`${BASE}/${groupId}/management/members/${userId}/unban`).then((r) => r.data);
export const removeMember = (groupId, userId) =>
  api.delete(`${BASE}/${groupId}/management/members/${userId}`).then((r) => r.data);

export const broadcastNotification = (groupId, payload) =>
  api.post(`${BASE}/${groupId}/management/broadcast`, payload).then((r) => r.data);
export const getModerationLog = (groupId, page = 1) =>
  api.get(`${BASE}/${groupId}/management/moderation-log`, { params: { page } }).then((r) => r.data);
export const getGroupReports = (groupId) => api.get(`${BASE}/${groupId}/management/reports`).then((r) => r.data);

export default api;