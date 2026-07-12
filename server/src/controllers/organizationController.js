import * as organizationService from '../services/organizationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.getOrganization(req.user.organizationId);
  sendSuccess(res, 'Organization', organization);
});

export const updateOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.updateOrganization(req.user.organizationId, req.body);
  sendSuccess(res, 'Organization updated', organization);
});
