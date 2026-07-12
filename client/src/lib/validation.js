import { z } from 'zod';

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email');

const username = z
  .string()
  .trim()
  .min(3, 'At least 3 characters')
  .max(30, 'Must be 30 characters or fewer')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Letters, numbers, "_" and "." only');

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[a-zA-Z]/, 'Must include a letter')
  .regex(/[0-9]/, 'Must include a number');

export const registerSchema = z.object({
  organizationName: z.string().trim().min(2, 'At least 2 characters'),
  name: z.string().trim().min(2, 'At least 2 characters'),
  email,
  username,
  password,
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const acceptInviteSchema = z.object({
  username,
  password,
});

export const inviteEmailSchema = z.object({
  email,
});

const emptyToUndefined = (val) => (val === '' ? undefined : val);

const departmentCode = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(20, 'Must be 20 characters or fewer')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, "_" and "-" only');

const optionalId = z.preprocess(emptyToUndefined, z.string().min(1).optional());

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  code: departmentCode,
  headUserId: optionalId,
  parentDepartmentId: optionalId,
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  code: departmentCode,
  headUserId: optionalId,
  parentDepartmentId: optionalId,
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  type: z.enum(['CSR_ACTIVITY', 'CHALLENGE']),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

const weight = z.coerce.number().int('Whole numbers only').min(0, 'Min 0').max(100, 'Max 100');

export const esgConfigSchema = z
  .object({
    environmentalWeight: weight,
    socialWeight: weight,
    governanceWeight: weight,
    autoEmissionCalculation: z.boolean(),
    evidenceRequired: z.boolean(),
    badgeAutoAward: z.boolean(),
  })
  .refine(
    (data) => data.environmentalWeight + data.socialWeight + data.governanceWeight === 100,
    { message: 'Weights must add up to 100', path: ['governanceWeight'] }
  );

export const XLSX_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const isXlsxFile = (file) =>
  Boolean(file) &&
  (file.name.toLowerCase().endsWith('.xlsx') || XLSX_MIME_TYPES.includes(file.type));
