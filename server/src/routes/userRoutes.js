import { Router } from 'express';
import multer from 'multer';

import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { inviteUserSchema } from '../validators/authValidators.js';
import { updateUserSchema } from '../validators/userValidators.js';
import AppError from '../utils/AppError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('Only .xlsx files are supported', 422));
    }
    cb(null, true);
  },
});

const handleImportUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(err.message, 422));
    }
    if (err) return next(err);
    next();
  });
};

const router = Router();

router.use('/api/users', authMiddleware);

router.get('/api/users/me/profile', userController.getMyProfile);

router.post(
  '/api/users/invite',
  requireRole('ADMIN'),
  validate(inviteUserSchema),
  userController.inviteUser
);
router.post('/api/users/import', requireRole('ADMIN'), handleImportUpload, userController.importUsers);
router.get('/api/users', requireRole('ADMIN'), userController.listUsers);
router.patch(
  '/api/users/:id',
  requireRole('ADMIN'),
  validate(updateUserSchema),
  userController.updateUser
);

export default router;
