import apiClient from './client';

export const listCarbonTransactions = (params) =>
  apiClient.get('/api/carbon-transactions', { params }).then((res) => res.data);

export const createCarbonTransaction = (data) =>
  apiClient.post('/api/carbon-transactions', data).then((res) => res.data);

export const updateCarbonTransaction = (id, data) =>
  apiClient.patch(`/api/carbon-transactions/${id}`, data).then((res) => res.data);

export const getEmissionsSummaryByDepartment = () =>
  apiClient.get('/api/carbon-transactions/summary-by-department').then((res) => res.data);
