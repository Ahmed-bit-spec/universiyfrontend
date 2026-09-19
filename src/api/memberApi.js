import api from "./client";

// ─── Members list ────────────────────────────────────────────────────────────
export const getGroupMembers = async (groupId, { search = "", filter = "all", page = 1 } = {}) => {
  const { data } = await api.get(`/groups/${groupId}/members`, {
    params: { search, filter, page },
  });
  return data;
};

export const getMemberStats = async (groupId) => {
  const { data } = await api.get(`/groups/${groupId}/members/stats`);
  return data;
};

// ─── Full profile (visible to every member, no role restriction) ────────────
export const getMemberProfile = async (groupId, userId) => {
  const { data } = await api.get(`/groups/${groupId}/members/${userId}/profile`);
  return data;
};

// ─── Lecturer / Admin actions ────────────────────────────────────────────────
export const promoteRepresentative = async (groupId, userId) => {
  const { data } = await api.patch(`/groups/${groupId}/members/${userId}/promote`);
  return data;
};

export const removeMember = async (groupId, userId) => {
  const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
  return data;
};

export const changeMemberRole = async (groupId, userId, role) => {
  const { data } = await api.patch(`/groups/${groupId}/members/${userId}/role`, { role });
  return data;
};

export const suspendMember = async (groupId, userId) => {
  const { data } = await api.patch(`/groups/${groupId}/members/${userId}/suspend`);
  return data;
};

export const exportMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members/export`, { responseType: "blob" });
  return response.data;
};