import apiClient from './client';

export const inviteUser = (email) =>
  apiClient.post('/api/users/invite', { email }).then((res) => res.data);

export const importUsers = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient
    .post('/api/users/import', formData, {
      headers: { 'Content-Type': undefined },
    })
    .then((res) => res.data);
};

export const listUsers = () =>
  apiClient.get('/api/users').then((res) => res.data);

export const getMyProfile = () =>
  apiClient.get('/api/users/me/profile').then((res) => res.data);
