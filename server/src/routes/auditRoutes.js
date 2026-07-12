import { Router } from 'express';

import * as auditController from '../controllers/auditController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createAuditSchema, updateAuditSchema } from '../validators/auditValidators.js';

const router = Router();

router.use('/api/audits', authMiddleware, requireRole('ADMIN'));

router.post('/api/audits', validate(createAuditSchema), auditController.createAudit);
router.get('/api/audits', auditController.listAudits);
router.get('/api/audits/:id', auditController.getAudit);
router.patch('/api/audits/:id', validate(updateAuditSchema), auditController.updateAudit);

export default router;
