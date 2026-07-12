import { Router } from 'express';

import * as operationalRecordController from '../controllers/operationalRecordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createOperationalRecordSchema } from '../validators/operationalRecordValidators.js';

const router = Router();

router.use('/api/operational-records', authMiddleware, requireRole('ADMIN'));

router.post(
  '/api/operational-records',
  validate(createOperationalRecordSchema),
  operationalRecordController.createOperationalRecord
);
router.post('/api/operational-records/process-pending', operationalRecordController.processPending);
router.post('/api/operational-records/seed-demo', operationalRecordController.seedDemoData);
router.get('/api/operational-records', operationalRecordController.listOperationalRecords);
router.get('/api/operational-records/:id', operationalRecordController.getOperationalRecord);

export default router;
