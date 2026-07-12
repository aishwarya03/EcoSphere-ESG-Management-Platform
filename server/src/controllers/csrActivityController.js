import * as csrActivityService from '../services/csrActivityService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

export const createCsrActivity = asyncHandler(async (req, res) => {
  const activity = await csrActivityService.createCsrActivity({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'CSR activity created', activity, 201);
});

export const listCsrActivities = asyncHandler(async (req, res) => {
  const { status, departmentId, categoryId } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const activities = await csrActivityService.listCsrActivities(req.user.organizationId, {
    status,
    departmentId,
    categoryId,
  });
  sendSuccess(res, 'CSR activities', activities);
});

export const getCsrActivity = asyncHandler(async (req, res) => {
  const activity = await csrActivityService.getCsrActivity(req.user.organizationId, req.params.id);
  sendSuccess(res, 'CSR activity', activity);
});

export const updateCsrActivity = asyncHandler(async (req, res) => {
  const activity = await csrActivityService.updateCsrActivity(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'CSR activity updated', activity);
});
