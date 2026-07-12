import apiClient from './client';

export const registerOrganization = (data) =>
  apiClient.post('/api/auth/register-organization', data).then((res) => res.data);

export const login = (data) =>
  apiClient.post('/api/auth/login', data).then((res) => res.data);

export const getMe = () =>
  apiClient.get('/api/auth/me').then((res) => res.data);

export const previewInvite = (token) =>
  apiClient.get(`/api/auth/invite/${token}`).then((res) => res.data);

export const acceptInvite = (token, data) =>
  apiClient.post(`/api/auth/invite/${token}/accept`, data).then((res) => res.data);
