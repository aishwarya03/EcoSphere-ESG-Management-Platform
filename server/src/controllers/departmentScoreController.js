import * as scoreService from '../services/departmentScoreService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const recomputeScores = asyncHandler(async (req, res) => {
  const scores = await scoreService.recomputeDepartmentScores(
    req.user.organizationId,
    req.body.departmentId
  );
  sendSuccess(res, 'Department scores recomputed', scores, 201);
});

export const listScores = asyncHandler(async (req, res) => {
  if (req.query.departmentId) {
    const history = await scoreService.getDepartmentScoreHistory(
      req.user.organizationId,
      req.query.departmentId
    );
    return sendSuccess(res, 'Department score history', history);
  }

  const scores = await scoreService.listLatestDepartmentScores(req.user.organizationId);
  sendSuccess(res, 'Latest department scores', scores);
});

export const getOverallScore = asyncHandler(async (req, res) => {
  const overall = await scoreService.getOverallEsgScore(req.user.organizationId);
  sendSuccess(res, 'Overall ESG score', overall);
});
