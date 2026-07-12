import { Router } from 'express';

import * as emissionFactorController from '../controllers/emissionFactorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createEmissionFactorSchema,
  updateEmissionFactorSchema,
} from '../validators/emissionFactorValidators.js';

const router = Router();

router.use('/api/emission-factors', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/emission-factors',
  validate(createEmissionFactorSchema),
  emissionFactorController.createEmissionFactor
);
router.get('/api/emission-factors', emissionFactorController.listEmissionFactors);
router.get('/api/emission-factors/:id', emissionFactorController.getEmissionFactor);
router.patch(
  '/api/emission-factors/:id',
  validate(updateEmissionFactorSchema),
  emissionFactorController.updateEmissionFactor
);

export default router;
