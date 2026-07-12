import { z } from 'zod';

export const createParticipationSchema = z.object({
  csrActivityId: z.string().trim().min(1),
  proof: z.string().trim().max(2000).nullish(),
  completionDate: z.coerce.date(),
});

export const updateOwnParticipationSchema = z
  .object({
    proof: z.string().trim().max(2000).nullish(),
    completionDate: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const reviewParticipationSchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  pointsEarned: z.number().int().nonnegative().optional(),
});
