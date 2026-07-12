import { z } from 'zod';

export const createChallengeParticipationSchema = z.object({
  challengeId: z.string().trim().min(1),
  proof: z.string().trim().max(2000).nullish(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const updateOwnChallengeParticipationSchema = z
  .object({
    progress: z.number().int().min(0).max(100).optional(),
    proof: z.string().trim().max(2000).nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const reviewChallengeParticipationSchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  xpAwarded: z.number().int().nonnegative().optional(),
});
