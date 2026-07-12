import * as goalService from '../services/environmentalGoalService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['ACTIVE', 'ACHIEVED', 'MISSED', 'ARCHIVED'];

export const createEnvironmentalGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.createEnvironmentalGoal({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Environmental goal created', goal, 201);
});

export const listEnvironmentalGoals = asyncHandler(async (req, res) => {
  const { status, departmentId } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const goals = await goalService.listEnvironmentalGoals(req.user.organizationId, {
    status,
    departmentId,
  });
  sendSuccess(res, 'Environmental goals', goals);
});

export const getEnvironmentalGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.getEnvironmentalGoal(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Environmental goal', goal);
});

export const updateEnvironmentalGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.updateEnvironmentalGoal(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Environmental goal updated', goal);
});
