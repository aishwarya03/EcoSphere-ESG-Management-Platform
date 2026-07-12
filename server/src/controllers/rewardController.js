import * as rewardService from '../services/rewardService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

export const createReward = asyncHandler(async (req, res) => {
  const reward = await rewardService.createReward({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Reward created', reward, 201);
});

export const listRewards = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const rewards = await rewardService.listRewards(req.user.organizationId, { status });
  sendSuccess(res, 'Rewards', rewards);
});

export const getReward = asyncHandler(async (req, res) => {
  const reward = await rewardService.getReward(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Reward', reward);
});

export const updateReward = asyncHandler(async (req, res) => {
  const reward = await rewardService.updateReward(req.user.organizationId, req.params.id, req.body);
  sendSuccess(res, 'Reward updated', reward);
});
