import * as operationalRecordService from '../services/operationalRecordService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_SOURCE_TYPES = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'ELECTRICITY', 'OTHER'];

export const createOperationalRecord = asyncHandler(async (req, res) => {
  const record = await operationalRecordService.createOperationalRecord({
    organizationId: req.user.organizationId,
    createdByUserId: req.user.sub,
    ...req.body,
  });
  sendSuccess(res, 'Operational record created', record, 201);
});

export const listOperationalRecords = asyncHandler(async (req, res) => {
  const { sourceType, departmentId, processed } = req.query;
  if (sourceType && !VALID_SOURCE_TYPES.includes(sourceType)) {
    throw new AppError(`sourceType must be one of: ${VALID_SOURCE_TYPES.join(', ')}`, 422);
  }

  const records = await operationalRecordService.listOperationalRecords(req.user.organizationId, {
    sourceType,
    departmentId,
    processed: processed === undefined ? undefined : processed === 'true',
  });
  sendSuccess(res, 'Operational records', records);
});

export const getOperationalRecord = asyncHandler(async (req, res) => {
  const record = await operationalRecordService.getOperationalRecord(
    req.user.organizationId,
    req.params.id
  );
  sendSuccess(res, 'Operational record', record);
});

export const processPending = asyncHandler(async (req, res) => {
  const result = await operationalRecordService.processPendingRecords(
    req.user.organizationId,
    req.user.sub
  );
  sendSuccess(res, 'Pending records processed', result);
});

export const seedDemoData = asyncHandler(async (req, res) => {
  const records = await operationalRecordService.seedDemoData(req.user.organizationId, req.user.sub);
  sendSuccess(res, 'Demo operational data seeded', records, 201);
});
