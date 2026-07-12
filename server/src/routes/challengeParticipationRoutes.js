import { Router } from 'express';

import * as participationController from '../controllers/challengeParticipationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createChallengeParticipationSchema,
  updateOwnChallengeParticipationSchema,
  reviewChallengeParticipationSchema,
} from '../validators/challengeParticipationValidators.js';

const router = Router();

router.use('/api/challenge-participations', authMiddleware);

router.post(
  '/api/challenge-participations',
  validate(createChallengeParticipationSchema),
  participationController.createParticipation
);
router.get('/api/challenge-participations', participationController.listParticipations);
router.get('/api/challenge-participations/:id', participationController.getParticipation);
router.patch(
  '/api/challenge-participations/:id',
  validate(updateOwnChallengeParticipationSchema),
  participationController.updateOwnParticipation
);
router.patch(
  '/api/challenge-participations/:id/review',
  requireRole('ADMIN'),
  validate(reviewChallengeParticipationSchema),
  participationController.reviewParticipation
);

export default router;
