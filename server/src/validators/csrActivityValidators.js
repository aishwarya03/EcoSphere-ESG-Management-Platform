import { z } from 'zod';

const dateRangeRefine = (data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
};

export const createCsrActivitySchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).nullish(),
    categoryId: z.string().trim().min(1).nullish(),
    departmentId: z.string().trim().min(1).nullish(),
    pointsValue: z.number().int().positive(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullish(),
  })
  .refine(dateRangeRefine, { message: 'startDate must be before endDate' });

export const updateCsrActivitySchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    categoryId: z.string().trim().min(1).nullish(),
    departmentId: z.string().trim().min(1).nullish(),
    pointsValue: z.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullish(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })
  .refine(dateRangeRefine, { message: 'startDate must be before endDate' });
