import { z } from 'zod';

export const createRewardSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  pointsRequired: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});

export const updateRewardSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    pointsRequired: z.number().int().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
