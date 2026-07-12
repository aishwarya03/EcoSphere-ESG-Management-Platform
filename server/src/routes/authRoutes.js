import { Router } from 'express';

import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  registerOrganizationSchema,
  loginSchema,
  acceptInviteSchema,
} from '../validators/authValidators.js';

const router = Router();

router.post(
  '/api/auth/register-organization',
  validate(registerOrganizationSchema),
  authController.registerOrganization
);
router.post('/api/auth/login', validate(loginSchema), authController.login);
router.get('/api/auth/me', authMiddleware, authController.me);
router.get('/api/auth/invite/:token', authController.previewInvite);
router.post(
  '/api/auth/invite/:token/accept',
  validate(acceptInviteSchema),
  authController.acceptInvite
);

export default router;
