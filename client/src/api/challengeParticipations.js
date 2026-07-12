import apiClient from './client';

export const listChallengeParticipations = (params) =>
  apiClient.get('/api/challenge-participations', { params }).then((res) => res.data);

export const createChallengeParticipation = (data) =>
  apiClient.post('/api/challenge-participations', data).then((res) => res.data);

export const updateOwnChallengeParticipation = (id, data) =>
  apiClient.patch(`/api/challenge-participations/${id}`, data).then((res) => res.data);

export const reviewChallengeParticipation = (id, data) =>
  apiClient.patch(`/api/challenge-participations/${id}/review`, data).then((res) => res.data);
