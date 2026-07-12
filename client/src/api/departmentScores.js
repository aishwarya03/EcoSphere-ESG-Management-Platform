import apiClient from './client';

export const recomputeScores = (departmentId) =>
  apiClient.post('/api/department-scores/recompute', { departmentId }).then((res) => res.data);

export const listLatestScores = () =>
  apiClient.get('/api/department-scores').then((res) => res.data);

export const getScoreHistory = (departmentId) =>
  apiClient.get('/api/department-scores', { params: { departmentId } }).then((res) => res.data);

export const getOverallScore = () =>
  apiClient.get('/api/department-scores/overall').then((res) => res.data);
