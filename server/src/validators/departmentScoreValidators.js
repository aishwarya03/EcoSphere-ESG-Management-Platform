import { z } from 'zod';

export const recomputeScoresSchema = z.object({
  departmentId: z.string().trim().min(1).nullish(),
});
