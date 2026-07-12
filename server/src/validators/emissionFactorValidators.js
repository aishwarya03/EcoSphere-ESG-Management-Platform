import { z } from 'zod';

const SOURCE_TYPES = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'ELECTRICITY', 'OTHER'];

const dateRangeRefine = (data) => {
  if (data.validFrom && data.validTo) {
    return data.validFrom < data.validTo;
  }
  return true;
};

export const createEmissionFactorSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    sourceType: z.enum(SOURCE_TYPES),
    unit: z.string().trim().min(1).max(40),
    co2ePerUnit: z.number().positive(),
    validFrom: z.coerce.date().nullish(),
    validTo: z.coerce.date().nullish(),
    source: z.string().trim().max(255).nullish(),
  })
  .refine(dateRangeRefine, { message: 'validFrom must be before validTo' });

export const updateEmissionFactorSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    sourceType: z.enum(SOURCE_TYPES).optional(),
    unit: z.string().trim().min(1).max(40).optional(),
    co2ePerUnit: z.number().positive().optional(),
    validFrom: z.coerce.date().nullish(),
    validTo: z.coerce.date().nullish(),
    source: z.string().trim().max(255).nullish(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })
  .refine(dateRangeRefine, { message: 'validFrom must be before validTo' });
