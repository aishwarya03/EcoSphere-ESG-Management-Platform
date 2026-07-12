import apiClient from './client';

export const getOrganization = () =>
  apiClient.get('/api/organization').then((res) => res.data);

export const updateOrganization = (data) =>
  apiClient.patch('/api/organization', data).then((res) => res.data);
