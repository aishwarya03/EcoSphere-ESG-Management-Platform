import apiClient from './client';

export const listCsrActivities = (params) =>
  apiClient.get('/api/csr-activities', { params }).then((res) => res.data);

export const createCsrActivity = (data) =>
  apiClient.post('/api/csr-activities', data).then((res) => res.data);

export const updateCsrActivity = (id, data) =>
  apiClient.patch(`/api/csr-activities/${id}`, data).then((res) => res.data);
