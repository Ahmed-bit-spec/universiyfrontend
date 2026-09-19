// Adjust this import to match wherever your app's shared axios instance
// lives (e.g. "@/api/axios" or "@/lib/http").

import api from "./client";

const BASE = "/roadmaps";

export const listRoadmaps = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

export const getRoadmap = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

export const createRoadmap = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

export const updateRoadmap = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
  return data;
};

export const deleteRoadmap = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

export const toggleRoadmapLike = async (id) => {
  const { data } = await api.post(`${BASE}/${id}/like`);
  return data;
};

export const toggleTopicComplete = async (id, topicId) => {
  const { data } = await api.post(`${BASE}/${id}/topics/${topicId}/toggle`);
  return data;
};

export const toggleModuleComplete = async (id, moduleId) => {
  const { data } = await api.post(`${BASE}/${id}/modules/${moduleId}/toggle`);
  return data;
};

export const submitAssignment = async (id, moduleId) => {
  const { data } = await api.post(`${BASE}/${id}/modules/${moduleId}/assignment/submit`);
  return data;
};

export const submitQuizResult = async (id, moduleId, score) => {
  const { data } = await api.post(`${BASE}/${id}/modules/${moduleId}/quiz/submit`, { score });
  return data;
};