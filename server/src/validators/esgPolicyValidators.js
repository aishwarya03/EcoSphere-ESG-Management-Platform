import { z } from 'zod';

export const createEsgPolicySchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).nullish(),
  effectiveDate: z.coerce.date(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const updateEsgPolicySchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(2000).nullish(),
    effectiveDate: z.coerce.date().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
