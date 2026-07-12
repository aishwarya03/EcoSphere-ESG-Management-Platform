import * as profileService from '../services/productEsgProfileService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.createProfile(
    req.user.organizationId,
    req.params.productId,
    req.body
  );
  sendSuccess(res, 'ESG profile created', profile, 201);
});

export const listProfiles = asyncHandler(async (req, res) => {
  const profiles = await profileService.listProfiles(req.user.organizationId, req.params.productId);
  sendSuccess(res, 'ESG profiles', profiles);
});

export const getCurrentProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getCurrentProfile(req.user.organizationId, req.params.productId);
  sendSuccess(res, 'Current ESG profile', profile);
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(
    req.user.organizationId,
    req.params.productId,
    req.params.id
  );
  sendSuccess(res, 'ESG profile', profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(
    req.user.organizationId,
    req.params.productId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'ESG profile updated', profile);
});
