import { Router } from 'express';

import * as departmentController from '../controllers/departmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidators.js';

const router = Router();

router.use('/api/departments', authMiddleware, requireRole('ADMIN'));

router.post('/api/departments', validate(createDepartmentSchema), departmentController.createDepartment);
router.get('/api/departments', departmentController.listDepartments);
router.get('/api/departments/:id', departmentController.getDepartment);
router.patch(
  '/api/departments/:id',
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

export default router;
