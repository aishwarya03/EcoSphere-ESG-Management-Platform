import * as departmentService from '../services/departmentService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment({
    organizationId: req.user.organizationId,
    ...req.body,
  });
  sendSuccess(res, 'Department created', department, 201);
});

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.listDepartments(req.user.organizationId);
  sendSuccess(res, 'Departments', departments);
});

export const getDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartment(req.user.organizationId, req.params.id);
  sendSuccess(res, 'Department', department);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  sendSuccess(res, 'Department updated', department);
});
