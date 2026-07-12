import apiClient from './client';

export const listBadges = (params) =>
  apiClient.get('/api/badges', { params }).then((res) => res.data);

export const createBadge = (data) =>
  apiClient.post('/api/badges', data).then((res) => res.data);

export const updateBadge = (id, data) =>
  apiClient.patch(`/api/badges/${id}`, data).then((res) => res.data);
