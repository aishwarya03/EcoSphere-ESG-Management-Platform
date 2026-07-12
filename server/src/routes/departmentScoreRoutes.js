import { Router } from 'express';

import * as departmentScoreController from '../controllers/departmentScoreController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { recomputeScoresSchema } from '../validators/departmentScoreValidators.js';

const router = Router();

router.use('/api/department-scores', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/department-scores/recompute',
  validate(recomputeScoresSchema),
  departmentScoreController.recomputeScores
);
router.get('/api/department-scores', departmentScoreController.listScores);
router.get('/api/department-scores/overall', departmentScoreController.getOverallScore);

export default router;
