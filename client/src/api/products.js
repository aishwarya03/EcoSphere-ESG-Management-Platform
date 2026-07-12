import apiClient from './client';

export const listProducts = (params) =>
  apiClient.get('/api/products', { params }).then((res) => res.data);

export const getProduct = (id) =>
  apiClient.get(`/api/products/${id}`).then((res) => res.data);

export const createProduct = (data) =>
  apiClient.post('/api/products', data).then((res) => res.data);

export const updateProduct = (id, data) =>
  apiClient.patch(`/api/products/${id}`, data).then((res) => res.data);

export const listEsgProfiles = (productId) =>
  apiClient.get(`/api/products/${productId}/esg-profiles`).then((res) => res.data);

export const createEsgProfile = (productId, data) =>
  apiClient.post(`/api/products/${productId}/esg-profiles`, data).then((res) => res.data);

export const updateEsgProfile = (productId, id, data) =>
  apiClient.patch(`/api/products/${productId}/esg-profiles/${id}`, data).then((res) => res.data);
