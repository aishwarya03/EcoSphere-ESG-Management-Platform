import * as emissionFactorService from '../services/emissionFactorService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_SOURCE_TYPES = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'ELECTRICITY', 'OTHER'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

export const createEmissionFactor = asyncHandler(async (req, res) => {
  const factor = await emissionFactorService.createEmissionFactor({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Emission factor created', factor, 201);
});

export const listEmissionFactors = asyncHandler(async (req, res) => {
  const { sourceType, status } = req.query;
  if (sourceType && !VALID_SOURCE_TYPES.includes(sourceType)) {
    throw new AppError(`sourceType must be one of: ${VALID_SOURCE_TYPES.join(', ')}`, 422);
  }
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const factors = await emissionFactorService.listEmissionFactors(req.user.organizationId, {
    sourceType,
    status,
  });
  sendSuccess(res, 'Emission factors', factors);
});

export const getEmissionFactor = asyncHandler(async (req, res) => {
  const factor = await emissionFactorService.getEmissionFactor(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Emission factor', factor);
});

export const updateEmissionFactor = asyncHandler(async (req, res) => {
  const factor = await emissionFactorService.updateEmissionFactor(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Emission factor updated', factor);
});
