import * as auditService from '../services/auditService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'];

export const createAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.createAudit({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Audit created', audit, 201);
});

export const listAudits = asyncHandler(async (req, res) => {
  const { status, departmentId } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const audits = await auditService.listAudits(req.user.organizationId, { status, departmentId });
  sendSuccess(res, 'Audits', audits);
});

export const getAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.getAudit(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Audit', audit);
});

export const updateAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.updateAudit(req.user.organizationId, req.params.id, req.body);
  sendSuccess(res, 'Audit updated', audit);
});
