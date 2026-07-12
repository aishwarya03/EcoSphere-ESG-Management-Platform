import { Router } from 'express';

import * as badgeController from '../controllers/badgeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createBadgeSchema, updateBadgeSchema } from '../validators/badgeValidators.js';

const router = Router();

router.use('/api/badges', authMiddleware, requireRole('ADMIN'));

router.post('/api/badges', validate(createBadgeSchema), badgeController.createBadge);
router.get('/api/badges', badgeController.listBadges);
router.get('/api/badges/:id', badgeController.getBadge);
router.patch('/api/badges/:id', validate(updateBadgeSchema), badgeController.updateBadge);

export default router;
