import { Router } from 'express';

import * as rewardController from '../controllers/rewardController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createRewardSchema, updateRewardSchema } from '../validators/rewardValidators.js';

const router = Router();

router.use('/api/rewards', authMiddleware, requireRole('ADMIN'));

router.post('/api/rewards', validate(createRewardSchema), rewardController.createReward);
router.get('/api/rewards', rewardController.listRewards);
router.get('/api/rewards/:id', rewardController.getReward);
router.patch('/api/rewards/:id', validate(updateRewardSchema), rewardController.updateReward);

export default router;
