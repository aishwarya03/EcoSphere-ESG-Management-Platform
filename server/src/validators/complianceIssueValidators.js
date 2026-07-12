import { z } from 'zod';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const createComplianceIssueSchema = z.object({
  auditId: z.string().trim().min(1),
  severity: z.enum(SEVERITIES),
  description: z.string().trim().min(1).max(2000),
  ownerId: z.string().trim().min(1),
  dueDate: z.coerce.date(),
  status: z.enum(STATUSES).optional(),
});

export const updateComplianceIssueSchema = z
  .object({
    severity: z.enum(SEVERITIES).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    ownerId: z.string().trim().min(1).optional(),
    dueDate: z.coerce.date().optional(),
    status: z.enum(STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });
