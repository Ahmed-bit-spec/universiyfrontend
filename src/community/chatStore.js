// Lightweight client-side chat store until Socket.IO backend is wired.

const CHATS_KEY = "uniso_community_chats";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
  } catch {
    return [];
  }
};

const save = (chats) => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  window.dispatchEvent(new CustomEvent("community:chats-updated"));
};

export const getChats = () =>
  load().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

export const getChatCount = () => getChats().length;

export const getOrCreateChat = (participant) => {
  if (!participant?._id) return null;
  const chats = load();
  const existing = chats.find((c) => c.participantId === participant._id);
  if (existing) return existing;

  const chat = {
    id:             `chat-${participant._id}`,
    participantId:  participant._id,
    participantName: participant.name ?? "User",
    participantPhoto: participant.photo ?? null,
    participantRole: participant.role ?? "student",
    participantDepartment: participant.department ?? null,
    participantUniversityId: participant.universityId || participant.studentId || null,
    participantVerified: Boolean(
      participant.isUniversityVerified || participant.universityVerified
    ),
    messages: [],
    lastMessage: "",
    updatedAt: new Date().toISOString(),
  };
  chats.unshift(chat);
  save(chats);
  return chat;
};

export const sendMessage = (chatId, text, senderId) => {
  const chats = load();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx === -1) return null;

  const message = {
    id:        `msg-${Date.now()}`,
    text:      text.trim(),
    senderId,
    createdAt: new Date().toISOString(),
  };

  chats[idx].messages = [...(chats[idx].messages ?? []), message];
  chats[idx].lastMessage = message.text;
  chats[idx].updatedAt = message.createdAt;
  save(chats);
  return message;
};

export const getChatById = (chatId) => load().find((c) => c.id === chatId) ?? null;
