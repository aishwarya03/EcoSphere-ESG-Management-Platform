import * as participationService from '../services/challengeParticipationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const createParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.createChallengeParticipation({
    organizationId: req.user.organizationId,
    employeeId: req.user.sub,
    ...req.body,
  });
  sendSuccess(res, 'Joined challenge', participation, 201);
});

export const listParticipations = asyncHandler(async (req, res) => {
  const { challengeId, approvalStatus, employeeId } = req.query;
  if (approvalStatus && !VALID_STATUSES.includes(approvalStatus)) {
    throw new AppError(`approvalStatus must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const participations = await participationService.listChallengeParticipations(
    req.user.organizationId,
    req.user,
    { challengeId, approvalStatus, employeeId }
  );
  sendSuccess(res, 'Challenge participations', participations);
});

export const getParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.getChallengeParticipation(
    req.user.organizationId,
    req.user,
    req.params.id
  );
  sendSuccess(res, 'Challenge participation', participation);
});

export const updateOwnParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.updateOwnChallengeParticipation(
    req.user.organizationId,
    req.user.sub,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Challenge participation updated', participation);
});

export const reviewParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.reviewChallengeParticipation(
    req.user.organizationId,
    req.user.sub,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Challenge participation reviewed', participation);
});
