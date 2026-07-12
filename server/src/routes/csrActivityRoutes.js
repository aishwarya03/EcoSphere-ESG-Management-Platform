import { Router } from 'express';

import * as csrActivityController from '../controllers/csrActivityController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createCsrActivitySchema,
  updateCsrActivitySchema,
} from '../validators/csrActivityValidators.js';

const router = Router();

router.use('/api/csr-activities', authMiddleware);

router.post(
  '/api/csr-activities',
  requireRole('ADMIN'),
  validate(createCsrActivitySchema),
  csrActivityController.createCsrActivity
);
router.get('/api/csr-activities', csrActivityController.listCsrActivities);
router.get('/api/csr-activities/:id', csrActivityController.getCsrActivity);
router.patch(
  '/api/csr-activities/:id',
  requireRole('ADMIN'),
  validate(updateCsrActivitySchema),
  csrActivityController.updateCsrActivity
);

export default router;
