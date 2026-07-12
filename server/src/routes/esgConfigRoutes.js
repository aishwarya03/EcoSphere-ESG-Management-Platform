import { Router } from 'express';

import * as esgConfigController from '../controllers/esgConfigController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { updateEsgConfigSchema } from '../validators/esgConfigValidators.js';

const router = Router();

router.use('/api/esg-config', authMiddleware, requireRole('ADMIN'));

router.get('/api/esg-config', esgConfigController.getEsgConfig);
router.patch('/api/esg-config', validate(updateEsgConfigSchema), esgConfigController.updateEsgConfig);

export default router;
