import { Router } from 'express';

import * as categoryController from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators.js';

const router = Router();

router.use('/api/categories', authMiddleware, requireRole('ADMIN'));

router.post('/api/categories', validate(createCategorySchema), categoryController.createCategory);
router.get('/api/categories', categoryController.listCategories);
router.get('/api/categories/:id', categoryController.getCategory);
router.patch('/api/categories/:id', validate(updateCategorySchema), categoryController.updateCategory);

export default router;
