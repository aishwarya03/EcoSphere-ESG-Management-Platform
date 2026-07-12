import { z } from 'zod';

export const createCarbonTransactionSchema = z.object({
  departmentId: z.string().trim().min(1).nullish(),
  emissionFactorId: z.string().trim().min(1),
  quantity: z.number().positive(),
  transactionDate: z.coerce.date(),
  notes: z.string().trim().max(2000).nullish(),
});

export const updateCarbonTransactionSchema = z
  .object({
    departmentId: z.string().trim().min(1).nullish(),
    emissionFactorId: z.string().trim().min(1).optional(),
    quantity: z.number().positive().optional(),
    transactionDate: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
