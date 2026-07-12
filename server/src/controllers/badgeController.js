import * as badgeService from '../services/badgeService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

export const createBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.createBadge({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Badge created', badge, 201);
});

export const listBadges = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const badges = await badgeService.listBadges(req.user.organizationId, { status });
  sendSuccess(res, 'Badges', badges);
});

export const getBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.getBadge(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Badge', badge);
});

export const updateBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.updateBadge(req.user.organizationId, req.params.id, req.body);
  sendSuccess(res, 'Badge updated', badge);
});
