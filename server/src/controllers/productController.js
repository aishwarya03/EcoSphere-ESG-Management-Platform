import * as productService from '../services/productService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_TYPES = ['PHYSICAL_GOOD', 'SERVICE'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Product created', product, 201);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  if (type && !VALID_TYPES.includes(type)) {
    throw new AppError(`type must be one of: ${VALID_TYPES.join(', ')}`, 422);
  }
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 422);
  }

  const products = await productService.listProducts(req.user.organizationId, { type, status });
  sendSuccess(res, 'Products', products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Product', product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.user.organizationId, req.params.id, req.body);
  sendSuccess(res, 'Product updated', product);
});
