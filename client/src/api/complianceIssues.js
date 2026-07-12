import apiClient from './client';

export const listComplianceIssues = (params) =>
  apiClient.get('/api/compliance-issues', { params }).then((res) => res.data);

export const createComplianceIssue = (data) =>
  apiClient.post('/api/compliance-issues', data).then((res) => res.data);

export const updateComplianceIssue = (id, data) =>
  apiClient.patch(`/api/compliance-issues/${id}`, data).then((res) => res.data);
