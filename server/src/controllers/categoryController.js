import * as categoryService from '../services/categoryService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_TYPES = ['CSR_ACTIVITY', 'CHALLENGE', 'PRODUCT'];

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Category created', category, 201);
});

export const listCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (type && !VALID_TYPES.includes(type)) {
    throw new AppError(`type must be one of: ${VALID_TYPES.join(', ')}`, 422);
  }
  const categories = await categoryService.listCategories(req.user.organizationId, type);
  sendSuccess(res, 'Categories', categories);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Category', category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Category updated', category);
});
