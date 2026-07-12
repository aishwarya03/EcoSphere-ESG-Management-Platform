import * as userService from '../services/userService.js';
import { parseImportRows } from '../services/userImportService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const inviteUser = asyncHandler(async (req, res) => {
  const user = await userService.inviteSingleUser({
    email: req.body.email,
    departmentId: req.body.departmentId,
    organizationId: req.user.organizationId,
  });
  sendSuccess(res, 'Invite sent', { id: user.id, email: user.email, status: user.status }, 201);
});

export const importUsers = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a .xlsx file', 422);
  }

  const rows = await parseImportRows(req.file.buffer);
  const result = await userService.importUsers({
    rows,
    organizationId: req.user.organizationId,
  });

  sendSuccess(res, 'Import complete', result, 201);
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listOrganizationUsers(req.user.organizationId);
  sendSuccess(res, 'Organization users', users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.organizationId, req.params.id, req.body);
  sendSuccess(res, 'User updated', user);
});
