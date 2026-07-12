import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username may only contain letters, numbers, underscores and dots'),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export const inviteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  departmentId: z.string().trim().min(1).nullish(),
});

export const acceptInviteSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username may only contain letters, numbers, underscores and dots'),
  password: z.string().min(8).max(72),
});
