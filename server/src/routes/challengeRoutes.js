import { Router } from 'express';

import * as challengeController from '../controllers/challengeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createChallengeSchema, updateChallengeSchema } from '../validators/challengeValidators.js';

const router = Router();

router.use('/api/challenges', authMiddleware);

router.post(
  '/api/challenges',
  requireRole('ADMIN'),
  validate(createChallengeSchema),
  challengeController.createChallenge
);
router.get('/api/challenges', challengeController.listChallenges);
router.get('/api/challenges/:id', challengeController.getChallenge);
router.patch(
  '/api/challenges/:id',
  requireRole('ADMIN'),
  validate(updateChallengeSchema),
  challengeController.updateChallenge
);

export default router;
