import { z } from 'zod';

const dateRangeRefine = (data) => {
  if (data.startDate && data.targetDate) {
    return data.startDate < data.targetDate;
  }
  return true;
};

export const createEnvironmentalGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).nullish(),
    targetMetric: z.string().trim().min(1).max(120),
    baselineValue: z.number().nullish(),
    targetValue: z.number(),
    unit: z.string().trim().min(1).max(40),
    startDate: z.coerce.date(),
    targetDate: z.coerce.date(),
    departmentId: z.string().trim().min(1).nullish(),
  })
  .refine(dateRangeRefine, { message: 'startDate must be before targetDate' });

export const updateEnvironmentalGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    targetMetric: z.string().trim().min(1).max(120).optional(),
    baselineValue: z.number().nullish(),
    targetValue: z.number().optional(),
    unit: z.string().trim().min(1).max(40).optional(),
    startDate: z.coerce.date().optional(),
    targetDate: z.coerce.date().optional(),
    departmentId: z.string().trim().min(1).nullish(),
    status: z.enum(['ACTIVE', 'ACHIEVED', 'MISSED', 'ARCHIVED']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })
  .refine(dateRangeRefine, { message: 'startDate must be before targetDate' });
