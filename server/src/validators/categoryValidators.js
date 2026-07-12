import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['CSR_ACTIVITY', 'CHALLENGE', 'PRODUCT']),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
