import { Router } from 'express';

import * as esgPolicyController from '../controllers/esgPolicyController.js';
import * as ackController from '../controllers/policyAcknowledgementController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createEsgPolicySchema, updateEsgPolicySchema } from '../validators/esgPolicyValidators.js';

const router = Router();

router.use('/api/esg-policies', authMiddleware);

router.post(
  '/api/esg-policies',
  requireRole('ADMIN'),
  validate(createEsgPolicySchema),
  esgPolicyController.createEsgPolicy
);
router.get('/api/esg-policies', esgPolicyController.listEsgPolicies);
router.get('/api/esg-policies/:id', esgPolicyController.getEsgPolicy);
router.patch(
  '/api/esg-policies/:id',
  requireRole('ADMIN'),
  validate(updateEsgPolicySchema),
  esgPolicyController.updateEsgPolicy
);

router.post('/api/esg-policies/:policyId/acknowledgements', ackController.acknowledgePolicy);
router.get(
  '/api/esg-policies/:policyId/acknowledgements',
  requireRole('ADMIN'),
  ackController.listAcknowledgements
);
router.get('/api/esg-policies/:policyId/acknowledgements/me', ackController.getMyAcknowledgement);

export default router;
