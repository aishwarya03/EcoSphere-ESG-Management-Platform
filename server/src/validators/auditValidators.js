import { z } from 'zod';

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'];

export const createAuditSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  departmentId: z.string().trim().min(1).nullish(),
  auditor: z.string().trim().max(120).nullish(),
  auditDate: z.coerce.date(),
  status: z.enum(STATUSES).optional(),
  findingsSummary: z.string().trim().max(4000).nullish(),
});

export const updateAuditSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullish(),
    departmentId: z.string().trim().min(1).nullish(),
    auditor: z.string().trim().max(120).nullish(),
    auditDate: z.coerce.date().optional(),
    status: z.enum(STATUSES).optional(),
    findingsSummary: z.string().trim().max(4000).nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
