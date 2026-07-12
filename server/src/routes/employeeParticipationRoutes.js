import { Router } from 'express';

import * as participationController from '../controllers/employeeParticipationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createParticipationSchema,
  updateOwnParticipationSchema,
  reviewParticipationSchema,
} from '../validators/employeeParticipationValidators.js';

const router = Router();

router.use('/api/employee-participations', authMiddleware);

router.post(
  '/api/employee-participations',
  validate(createParticipationSchema),
  participationController.createParticipation
);
router.get('/api/employee-participations', participationController.listParticipations);
router.get('/api/employee-participations/:id', participationController.getParticipation);
router.patch(
  '/api/employee-participations/:id',
  validate(updateOwnParticipationSchema),
  participationController.updateOwnParticipation
);
router.patch(
  '/api/employee-participations/:id/review',
  requireRole('ADMIN'),
  validate(reviewParticipationSchema),
  participationController.reviewParticipation
);

export default router;
