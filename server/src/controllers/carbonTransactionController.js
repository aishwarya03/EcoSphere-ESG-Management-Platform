import * as carbonTransactionService from '../services/carbonTransactionService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createCarbonTransaction = asyncHandler(async (req, res) => {
  const transaction = await carbonTransactionService.createCarbonTransaction({
    organizationId: req.user.organizationId,
    createdByUserId: req.user.sub,
    ...req.body,
  });
  sendSuccess(res, 'Carbon transaction created', transaction, 201);
});

export const listCarbonTransactions = asyncHandler(async (req, res) => {
  const { departmentId, emissionFactorId, dateFrom, dateTo } = req.query;
  const transactions = await carbonTransactionService.listCarbonTransactions(req.user.organizationId, {
    departmentId,
    emissionFactorId,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });
  sendSuccess(res, 'Carbon transactions', transactions);
});

export const getCarbonTransaction = asyncHandler(async (req, res) => {
  const transaction = await carbonTransactionService.getCarbonTransaction(
    req.user.organizationId,
    req.params.id
  );
  sendSuccess(res, 'Carbon transaction', transaction);
});

export const updateCarbonTransaction = asyncHandler(async (req, res) => {
  const transaction = await carbonTransactionService.updateCarbonTransaction(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Carbon transaction updated', transaction);
});

export const getEmissionsSummaryByDepartment = asyncHandler(async (req, res) => {
  const summary = await carbonTransactionService.getEmissionsSummaryByDepartment(
    req.user.organizationId
  );
  sendSuccess(res, 'Emissions summary by department', summary);
});
