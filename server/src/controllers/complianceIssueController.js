import * as complianceIssueService from '../services/complianceIssueService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const createComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await complianceIssueService.createComplianceIssue({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Compliance issue created', issue, 201);
});

export const listComplianceIssues = asyncHandler(async (req, res) => {
  const { status, severity, auditId, ownerId, overdue } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    throw new AppError(`severity must be one of: ${VALID_SEVERITIES.join(', ')}`, 422);
  }

  const issues = await complianceIssueService.listComplianceIssues(req.user.organizationId, {
    status,
    severity,
    auditId,
    ownerId,
    overdue: overdue === 'true',
  });
  sendSuccess(res, 'Compliance issues', issues);
});

export const getComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await complianceIssueService.getComplianceIssue(
    req.user.organizationId,
    req.params.id
  );
  sendSuccess(res, 'Compliance issue', issue);
});

export const updateComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await complianceIssueService.updateComplianceIssue(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Compliance issue updated', issue);
});
