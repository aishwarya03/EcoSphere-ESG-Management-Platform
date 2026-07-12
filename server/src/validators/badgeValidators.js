import { z } from 'zod';

const UNLOCK_METRICS = ['XP_TOTAL', 'CHALLENGES_COMPLETED', 'CSR_PARTICIPATIONS_COMPLETED'];

export const createBadgeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  icon: z.string().trim().max(80).nullish(),
  unlockMetric: z.enum(UNLOCK_METRICS),
  unlockThreshold: z.number().int().positive(),
});

export const updateBadgeSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    icon: z.string().trim().max(80).nullish(),
    unlockMetric: z.enum(UNLOCK_METRICS).optional(),
    unlockThreshold: z.number().int().positive().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
