import apiClient from './client';

export const listChallenges = (params) =>
  apiClient.get('/api/challenges', { params }).then((res) => res.data);

export const createChallenge = (data) =>
  apiClient.post('/api/challenges', data).then((res) => res.data);

export const updateChallenge = (id, data) =>
  apiClient.patch(`/api/challenges/${id}`, data).then((res) => res.data);
