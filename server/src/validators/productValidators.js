import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Code may only contain letters, numbers, underscores and dashes')
    .transform((v) => v.toUpperCase()),
  type: z.enum(['PHYSICAL_GOOD', 'SERVICE']),
  categoryId: z.string().trim().min(1).nullish(),
  description: z.string().trim().max(2000).nullish(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    code: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Code may only contain letters, numbers, underscores and dashes')
      .transform((v) => v.toUpperCase())
      .optional(),
    type: z.enum(['PHYSICAL_GOOD', 'SERVICE']).optional(),
    categoryId: z.string().trim().min(1).nullish(),
    description: z.string().trim().max(2000).nullish(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
