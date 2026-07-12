import { Router } from 'express';

import * as productController from '../controllers/productController.js';
import * as profileController from '../controllers/productEsgProfileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidators.js';
import {
  createEsgProfileSchema,
  updateEsgProfileSchema,
} from '../validators/productEsgProfileValidators.js';

const router = Router();

router.use('/api/products', authMiddleware, requireRole('ADMIN'));

router.post('/api/products', validate(createProductSchema), productController.createProduct);
router.get('/api/products', productController.listProducts);
router.get('/api/products/:id', productController.getProduct);
router.patch('/api/products/:id', validate(updateProductSchema), productController.updateProduct);

router.post(
  '/api/products/:productId/esg-profiles',
  validate(createEsgProfileSchema),
  profileController.createProfile
);
router.get('/api/products/:productId/esg-profiles', profileController.listProfiles);
router.get('/api/products/:productId/esg-profiles/current', profileController.getCurrentProfile);
router.get('/api/products/:productId/esg-profiles/:id', profileController.getProfile);
router.patch(
  '/api/products/:productId/esg-profiles/:id',
  validate(updateEsgProfileSchema),
  profileController.updateProfile
);

export default router;
