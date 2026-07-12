import apiClient from './client';

export const listOperationalRecords = (params) =>
  apiClient.get('/api/operational-records', { params }).then((res) => res.data);

export const createOperationalRecord = (data) =>
  apiClient.post('/api/operational-records', data).then((res) => res.data);

export const processPendingRecords = () =>
  apiClient.post('/api/operational-records/process-pending').then((res) => res.data);

export const seedDemoData = () =>
  apiClient.post('/api/operational-records/seed-demo').then((res) => res.data);
