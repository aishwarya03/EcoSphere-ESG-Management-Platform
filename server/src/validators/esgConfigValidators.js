import { z } from 'zod';

const weightField = z.number().int().min(0).max(100);

export const updateEsgConfigSchema = z
  .object({
    environmentalWeight: weightField.optional(),
    socialWeight: weightField.optional(),
    governanceWeight: weightField.optional(),
    autoEmissionCalculation: z.boolean().optional(),
    evidenceRequired: z.boolean().optional(),
    badgeAutoAward: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })
  .refine(
    (data) => {
      const weights = [data.environmentalWeight, data.socialWeight, data.governanceWeight];
      const anyProvided = weights.some((w) => w !== undefined);
      if (!anyProvided) return true;
      return weights.every((w) => w !== undefined);
    },
    { message: 'environmentalWeight, socialWeight and governanceWeight must be updated together' }
  )
  .refine(
    (data) => {
      if (data.environmentalWeight === undefined) return true;
      return data.environmentalWeight + data.socialWeight + data.governanceWeight === 100;
    },
    { message: 'environmentalWeight + socialWeight + governanceWeight must sum to 100' }
  );
