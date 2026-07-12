import apiClient from './client';

export const listAudits = (params) =>
  apiClient.get('/api/audits', { params }).then((res) => res.data);

export const createAudit = (data) =>
  apiClient.post('/api/audits', data).then((res) => res.data);

export const updateAudit = (id, data) =>
  apiClient.patch(`/api/audits/${id}`, data).then((res) => res.data);
