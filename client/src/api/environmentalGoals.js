import apiClient from './client';

export const listEnvironmentalGoals = (params) =>
  apiClient.get('/api/environmental-goals', { params }).then((res) => res.data);

export const createEnvironmentalGoal = (data) =>
  apiClient.post('/api/environmental-goals', data).then((res) => res.data);

export const updateEnvironmentalGoal = (id, data) =>
  apiClient.patch(`/api/environmental-goals/${id}`, data).then((res) => res.data);
