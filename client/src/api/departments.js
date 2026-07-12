import apiClient from './client';

export const listDepartments = () =>
  apiClient.get('/api/departments').then((res) => res.data);

export const getDepartment = (id) =>
  apiClient.get(`/api/departments/${id}`).then((res) => res.data);

export const createDepartment = (data) =>
  apiClient.post('/api/departments', data).then((res) => res.data);

export const updateDepartment = (id, data) =>
  apiClient.patch(`/api/departments/${id}`, data).then((res) => res.data);
