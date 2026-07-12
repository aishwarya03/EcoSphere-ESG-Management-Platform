import apiClient from './client';

export const getEsgConfig = () =>
  apiClient.get('/api/esg-config').then((res) => res.data);

export const updateEsgConfig = (data) =>
  apiClient.patch('/api/esg-config', data).then((res) => res.data);
