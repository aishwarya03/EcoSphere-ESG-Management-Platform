import * as esgPolicyService from '../services/esgPolicyService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export const createEsgPolicy = asyncHandler(async (req, res) => {
  const policy = await esgPolicyService.createEsgPolicy({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'ESG policy created', policy, 201);
});

export const listEsgPolicies = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const policies = await esgPolicyService.listEsgPolicies(req.user.organizationId, { status });
  sendSuccess(res, 'ESG policies', policies);
});

export const getEsgPolicy = asyncHandler(async (req, res) => {
  const policy = await esgPolicyService.getEsgPolicy(req.user.organizationId, req.params.id);
  sendSuccess(res, 'ESG policy', policy);
});

export const updateEsgPolicy = asyncHandler(async (req, res) => {
  const policy = await esgPolicyService.updateEsgPolicy(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'ESG policy updated', policy);
});
