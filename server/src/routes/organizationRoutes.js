import { Router } from 'express';

import * as organizationController from '../controllers/organizationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { updateOrganizationSchema } from '../validators/organizationValidators.js';

const router = Router();

router.use('/api/organization', authMiddleware, requireRole('ADMIN'));

router.get('/api/organization', organizationController.getOrganization);
router.patch(
  '/api/organization',
  validate(updateOrganizationSchema),
  organizationController.updateOrganization
);

export default router;
