import * as esgConfigService from '../services/esgConfigService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getEsgConfig = asyncHandler(async (req, res) => {
  const config = await esgConfigService.getOrCreateEsgConfig(req.user.organizationId);
  sendSuccess(res, 'ESG configuration', config);
});

export const updateEsgConfig = asyncHandler(async (req, res) => {
  const config = await esgConfigService.updateEsgConfig(req.user.organizationId, req.body);
  sendSuccess(res, 'ESG configuration updated', config);
});
