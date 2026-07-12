import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Code may only contain letters, numbers, underscores and dashes')
    .transform((v) => v.toUpperCase()),
  headUserId: z.string().trim().min(1).nullish(),
  parentDepartmentId: z.string().trim().min(1).nullish(),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    code: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Code may only contain letters, numbers, underscores and dashes')
      .transform((v) => v.toUpperCase())
      .optional(),
    headUserId: z.string().trim().min(1).nullish(),
    parentDepartmentId: z.string().trim().min(1).nullish(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
