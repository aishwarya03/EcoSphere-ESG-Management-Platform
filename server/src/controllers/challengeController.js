import * as challengeService from '../services/challengeService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'];

export const createChallenge = asyncHandler(async (req, res) => {
  const challenge = await challengeService.createChallenge({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Challenge created', challenge, 201);
});

export const listChallenges = asyncHandler(async (req, res) => {
  const { status, categoryId } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const challenges = await challengeService.listChallenges(req.user.organizationId, { status, categoryId });
  sendSuccess(res, 'Challenges', challenges);
});

export const getChallenge = asyncHandler(async (req, res) => {
  const challenge = await challengeService.getChallenge(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Challenge', challenge);
});

export const updateChallenge = asyncHandler(async (req, res) => {
  const challenge = await challengeService.updateChallenge(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Challenge updated', challenge);
});
