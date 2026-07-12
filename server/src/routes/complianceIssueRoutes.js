import { Router } from 'express';

import * as complianceIssueController from '../controllers/complianceIssueController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import {
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
} from '../validators/complianceIssueValidators.js';

const router = Router();

router.use('/api/compliance-issues', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/compliance-issues',
  validate(createComplianceIssueSchema),
  complianceIssueController.createComplianceIssue
);
router.get('/api/compliance-issues', complianceIssueController.listComplianceIssues);
router.get('/api/compliance-issues/:id', complianceIssueController.getComplianceIssue);
router.patch(
  '/api/compliance-issues/:id',
  validate(updateComplianceIssueSchema),
  complianceIssueController.updateComplianceIssue
);

export default router;
