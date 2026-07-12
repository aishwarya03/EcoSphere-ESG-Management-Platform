import { z } from 'zod';

export const updateUserSchema = z
  .object({
    departmentId: z.string().trim().min(1).nullish(),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
