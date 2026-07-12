import apiClient from './client';

export const listParticipations = (params) =>
  apiClient.get('/api/employee-participations', { params }).then((res) => res.data);

export const createParticipation = (data) =>
  apiClient.post('/api/employee-participations', data).then((res) => res.data);

export const updateOwnParticipation = (id, data) =>
  apiClient.patch(`/api/employee-participations/${id}`, data).then((res) => res.data);

export const reviewParticipation = (id, data) =>
  apiClient.patch(`/api/employee-participations/${id}/review`, data).then((res) => res.data);
