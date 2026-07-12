import * as participationService from '../services/employeeParticipationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const createParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.createParticipation({
    organizationId: req.user.organizationId,
    employeeId: req.user.sub,
    ...req.body,
  });
  sendSuccess(res, 'Participation submitted', participation, 201);
});

export const listParticipations = asyncHandler(async (req, res) => {
  const { csrActivityId, approvalStatus, employeeId } = req.query;
  if (approvalStatus && !VALID_STATUSES.includes(approvalStatus)) {
    throw new AppError(`approvalStatus must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const participations = await participationService.listParticipations(
    req.user.organizationId,
    req.user,
    { csrActivityId, approvalStatus, employeeId }
  );
  sendSuccess(res, 'Participations', participations);
});

export const getParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.getParticipation(
    req.user.organizationId,
    req.user,
    req.params.id
  );
  sendSuccess(res, 'Participation', participation);
});

export const updateOwnParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.updateOwnParticipation(
    req.user.organizationId,
    req.user.sub,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Participation updated', participation);
});

export const reviewParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.reviewParticipation(
    req.user.organizationId,
    req.user.sub,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Participation reviewed', participation);
});
