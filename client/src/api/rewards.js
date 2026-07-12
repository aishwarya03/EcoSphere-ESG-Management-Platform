import apiClient from './client';

export const listRewards = (params) =>
  apiClient.get('/api/rewards', { params }).then((res) => res.data);

export const createReward = (data) =>
  apiClient.post('/api/rewards', data).then((res) => res.data);

export const updateReward = (id, data) =>
  apiClient.patch(`/api/rewards/${id}`, data).then((res) => res.data);
