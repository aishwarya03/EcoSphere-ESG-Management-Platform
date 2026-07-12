import { z } from 'zod';

const SOURCE_TYPES = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'ELECTRICITY', 'OTHER'];

export const createOperationalRecordSchema = z.object({
  departmentId: z.string().trim().min(1).nullish(),
  sourceType: z.enum(SOURCE_TYPES),
  description: z.string().trim().max(2000).nullish(),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(40),
  recordDate: z.coerce.date(),
});
