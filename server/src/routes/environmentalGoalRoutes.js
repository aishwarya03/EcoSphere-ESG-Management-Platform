import { Router } from 'express';

import * as environmentalGoalController from '../controllers/environmentalGoalController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createEnvironmentalGoalSchema,
  updateEnvironmentalGoalSchema,
} from '../validators/environmentalGoalValidators.js';

const router = Router();

router.use('/api/environmental-goals', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/environmental-goals',
  validate(createEnvironmentalGoalSchema),
  environmentalGoalController.createEnvironmentalGoal
);
router.get('/api/environmental-goals', environmentalGoalController.listEnvironmentalGoals);
router.get('/api/environmental-goals/:id', environmentalGoalController.getEnvironmentalGoal);
router.patch(
  '/api/environmental-goals/:id',
  validate(updateEnvironmentalGoalSchema),
  environmentalGoalController.updateEnvironmentalGoal
);

export default router;
