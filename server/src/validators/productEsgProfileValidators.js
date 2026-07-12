import { z } from 'zod';

const metricSchema = z.object({
  pillar: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']),
  name: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(255),
  unit: z.string().trim().max(40).nullish(),
});

export const createEsgProfileSchema = z.object({
  assessedAt: z.coerce.date().optional(),
  carbonFootprintKgCo2e: z.number().nonnegative().nullish(),
  overallScore: z.number().min(0).max(100).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  metrics: z.array(metricSchema).default([]),
});

export const updateEsgProfileSchema = z
  .object({
    assessedAt: z.coerce.date().optional(),
    carbonFootprintKgCo2e: z.number().nonnegative().nullish(),
    overallScore: z.number().min(0).max(100).nullish(),
    notes: z.string().trim().max(2000).nullish(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    metrics: z.array(metricSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
