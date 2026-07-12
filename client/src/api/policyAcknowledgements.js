import apiClient from './client';

export const acknowledgePolicy = (policyId) =>
  apiClient.post(`/api/esg-policies/${policyId}/acknowledgements`).then((res) => res.data);

export const listAcknowledgements = (policyId) =>
  apiClient.get(`/api/esg-policies/${policyId}/acknowledgements`).then((res) => res.data);

export const getMyAcknowledgement = (policyId) =>
  apiClient.get(`/api/esg-policies/${policyId}/acknowledgements/me`).then((res) => res.data);
