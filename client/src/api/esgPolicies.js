import apiClient from './client';

export const listEsgPolicies = (params) =>
  apiClient.get('/api/esg-policies', { params }).then((res) => res.data);

export const createEsgPolicy = (data) =>
  apiClient.post('/api/esg-policies', data).then((res) => res.data);

export const updateEsgPolicy = (id, data) =>
  apiClient.patch(`/api/esg-policies/${id}`, data).then((res) => res.data);
