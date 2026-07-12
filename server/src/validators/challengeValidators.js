import { z } from 'zod';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'];

export const createChallengeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  categoryId: z.string().trim().min(1).nullish(),
  xp: z.number().int().positive(),
  difficulty: z.enum(DIFFICULTIES),
  evidenceRequired: z.boolean().optional(),
  deadline: z.coerce.date(),
  status: z.enum(STATUSES).optional(),
});

export const updateChallengeSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    categoryId: z.string().trim().min(1).nullish(),
    xp: z.number().int().positive().optional(),
    difficulty: z.enum(DIFFICULTIES).optional(),
    evidenceRequired: z.boolean().optional(),
    deadline: z.coerce.date().optional(),
    status: z.enum(STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
