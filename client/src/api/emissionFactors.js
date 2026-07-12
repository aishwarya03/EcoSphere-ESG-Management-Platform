import apiClient from './client';

export const listEmissionFactors = (params) =>
  apiClient.get('/api/emission-factors', { params }).then((res) => res.data);

export const createEmissionFactor = (data) =>
  apiClient.post('/api/emission-factors', data).then((res) => res.data);

export const updateEmissionFactor = (id, data) =>
  apiClient.patch(`/api/emission-factors/${id}`, data).then((res) => res.data);
