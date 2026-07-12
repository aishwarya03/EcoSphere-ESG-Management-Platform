import { Router } from 'express';

import * as esgPolicyController from '../controllers/esgPolicyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createEsgPolicySchema, updateEsgPolicySchema } from '../validators/esgPolicyValidators.js';

const router = Router();

router.use('/api/esg-policies', authMiddleware, requireRole('ADMIN'));

router.post('/api/esg-policies', validate(createEsgPolicySchema), esgPolicyController.createEsgPolicy);
router.get('/api/esg-policies', esgPolicyController.listEsgPolicies);
router.get('/api/esg-policies/:id', esgPolicyController.getEsgPolicy);
router.patch(
  '/api/esg-policies/:id',
  validate(updateEsgPolicySchema),
  esgPolicyController.updateEsgPolicy
);

export default router;
