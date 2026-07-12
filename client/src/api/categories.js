import apiClient from './client';

export const listCategories = (type) =>
  apiClient.get('/api/categories', { params: type ? { type } : undefined }).then((res) => res.data);

export const getCategory = (id) =>
  apiClient.get(`/api/categories/${id}`).then((res) => res.data);

export const createCategory = (data) =>
  apiClient.post('/api/categories', data).then((res) => res.data);

export const updateCategory = (id, data) =>
  apiClient.patch(`/api/categories/${id}`, data).then((res) => res.data);
