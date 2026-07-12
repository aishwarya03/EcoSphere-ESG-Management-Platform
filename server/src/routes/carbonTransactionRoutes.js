import { Router } from 'express';

import * as carbonTransactionController from '../controllers/carbonTransactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createCarbonTransactionSchema,
  updateCarbonTransactionSchema,
} from '../validators/carbonTransactionValidators.js';

const router = Router();

router.use('/api/carbon-transactions', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/carbon-transactions',
  validate(createCarbonTransactionSchema),
  carbonTransactionController.createCarbonTransaction
);
router.get('/api/carbon-transactions', carbonTransactionController.listCarbonTransactions);
router.get(
  '/api/carbon-transactions/summary-by-department',
  carbonTransactionController.getEmissionsSummaryByDepartment
);
router.get('/api/carbon-transactions/:id', carbonTransactionController.getCarbonTransaction);
router.patch(
  '/api/carbon-transactions/:id',
  validate(updateCarbonTransactionSchema),
  carbonTransactionController.updateCarbonTransaction
);

export default router;
