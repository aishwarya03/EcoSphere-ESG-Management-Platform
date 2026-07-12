import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const registerOrganization = asyncHandler(async (req, res) => {
  const result = await authService.registerOrganization(req.body);
  sendSuccess(res, 'Organization registered', result, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 'Login successful', result);
});

export const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.sub);
  sendSuccess(res, 'Current user', result);
});

export const previewInvite = asyncHandler(async (req, res) => {
  const result = await authService.getInvitePreview(req.params.token);
  sendSuccess(res, 'Invite is valid', result);
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const result = await authService.acceptInvite(req.params.token, req.body);
  sendSuccess(res, 'Account activated', result);
});
