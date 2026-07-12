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

export const CATEGORY_TYPES = ['CSR_ACTIVITY', 'CHALLENGE', 'PRODUCT'];

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  type: z.enum(CATEGORY_TYPES),
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

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined ? undefined : Number(v)),
  z.number().optional()
);
const requiredCode = (max) =>
  z
    .string()
    .trim()
    .min(1, 'Required')
    .max(max, 'Too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, "_" and "-" only');

export const organizationSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(120, 'Too long'),
  type: z.preprocess(emptyToUndefined, z.string().trim().max(80, 'Too long').optional()),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  code: requiredCode(40),
  type: z.enum(['PHYSICAL_GOOD', 'SERVICE']),
  categoryId: optionalId,
  description: z.string().trim().max(2000, 'Too long').optional(),
});
export const updateProductSchema = createProductSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const esgMetricSchema = z.object({
  pillar: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']),
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  value: z.string().trim().min(1, 'Required').max(255, 'Too long'),
  unit: z.string().trim().max(40, 'Too long').optional(),
});

export const esgProfileSchema = z.object({
  assessedAt: optionalDate,
  carbonFootprintKgCo2e: optionalNumber,
  overallScore: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(0, 'Min 0').max(100, 'Max 100').optional()
  ),
  notes: z.string().trim().max(2000, 'Too long').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  metrics: z.array(esgMetricSchema),
});

export const SOURCE_TYPES = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'ELECTRICITY', 'OTHER'];

export const operationalRecordSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES),
  departmentId: optionalId,
  description: z.string().trim().max(2000, 'Too long').optional(),
  quantity: z.coerce.number({ invalid_type_error: 'Required' }).positive('Must be greater than 0'),
  unit: z.string().trim().min(1, 'Required').max(40, 'Too long'),
  recordDate: z.coerce.date({ invalid_type_error: 'Required' }),
});

const dateRangeCheck = (from, to) => (data) => {
  if (data[from] && data[to]) return data[from] < data[to];
  return true;
};

export const createEmissionFactorSchema = z
  .object({
    name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
    sourceType: z.enum(SOURCE_TYPES),
    unit: z.string().trim().min(1, 'Required').max(40, 'Too long'),
    co2ePerUnit: z.coerce.number({ invalid_type_error: 'Required' }).positive('Must be greater than 0'),
    validFrom: optionalDate,
    validTo: optionalDate,
    source: z.string().trim().max(255, 'Too long').optional(),
  })
  .refine(dateRangeCheck('validFrom', 'validTo'), {
    message: 'Valid from must be before valid to',
    path: ['validTo'],
  });
export const updateEmissionFactorSchema = z
  .object({
    name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
    sourceType: z.enum(SOURCE_TYPES),
    unit: z.string().trim().min(1, 'Required').max(40, 'Too long'),
    co2ePerUnit: z.coerce.number({ invalid_type_error: 'Required' }).positive('Must be greater than 0'),
    validFrom: optionalDate,
    validTo: optionalDate,
    source: z.string().trim().max(255, 'Too long').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine(dateRangeCheck('validFrom', 'validTo'), {
    message: 'Valid from must be before valid to',
    path: ['validTo'],
  });

const environmentalGoalFields = {
  title: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  targetMetric: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  baselineValue: optionalNumber,
  targetValue: z.coerce.number({ invalid_type_error: 'Required' }),
  unit: z.string().trim().min(1, 'Required').max(40, 'Too long'),
  startDate: z.coerce.date({ invalid_type_error: 'Required' }),
  targetDate: z.coerce.date({ invalid_type_error: 'Required' }),
  departmentId: optionalId,
};
export const createEnvironmentalGoalSchema = z
  .object(environmentalGoalFields)
  .refine(dateRangeCheck('startDate', 'targetDate'), {
    message: 'Start date must be before target date',
    path: ['targetDate'],
  });
export const updateEnvironmentalGoalSchema = z
  .object({ ...environmentalGoalFields, status: z.enum(['ACTIVE', 'ACHIEVED', 'MISSED', 'ARCHIVED']) })
  .refine(dateRangeCheck('startDate', 'targetDate'), {
    message: 'Start date must be before target date',
    path: ['targetDate'],
  });

export const esgPolicySchema = z.object({
  title: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  category: z.string().trim().min(1, 'Required').max(80, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  effectiveDate: z.coerce.date({ invalid_type_error: 'Required' }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

const UNLOCK_METRICS = ['XP_TOTAL', 'CHALLENGES_COMPLETED', 'CSR_PARTICIPATIONS_COMPLETED'];
export const createBadgeSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  icon: z.string().trim().max(80, 'Too long').optional(),
  unlockMetric: z.enum(UNLOCK_METRICS),
  unlockThreshold: z.coerce
    .number({ invalid_type_error: 'Required' })
    .int('Whole numbers only')
    .positive('Must be greater than 0'),
});
export const updateBadgeSchema = createBadgeSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const createRewardSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  pointsRequired: z.coerce
    .number({ invalid_type_error: 'Required' })
    .int('Whole numbers only')
    .positive('Must be greater than 0'),
  stock: z.coerce
    .number({ invalid_type_error: 'Required' })
    .int('Whole numbers only')
    .nonnegative('Cannot be negative'),
});
export const updateRewardSchema = createRewardSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const carbonTransactionSchema = z.object({
  departmentId: optionalId,
  emissionFactorId: z.string().trim().min(1, 'Required'),
  quantity: z.coerce.number({ invalid_type_error: 'Required' }).positive('Must be greater than 0'),
  transactionDate: z.coerce.date({ invalid_type_error: 'Required' }),
  notes: z.string().trim().max(2000, 'Too long').optional(),
});

const csrActivityFields = {
  title: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  categoryId: optionalId,
  departmentId: optionalId,
  pointsValue: z.coerce
    .number({ invalid_type_error: 'Required' })
    .int('Whole numbers only')
    .positive('Must be greater than 0'),
  startDate: z.coerce.date({ invalid_type_error: 'Required' }),
  endDate: optionalDate,
};
export const createCsrActivitySchema = z
  .object(csrActivityFields)
  .refine(dateRangeCheck('startDate', 'endDate'), {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });
export const updateCsrActivitySchema = z
  .object({ ...csrActivityFields, status: z.enum(['ACTIVE', 'INACTIVE']) })
  .refine(dateRangeCheck('startDate', 'endDate'), {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

export const createParticipationSchema = z.object({
  csrActivityId: z.string().trim().min(1, 'Required'),
  proof: z.string().trim().max(2000, 'Too long').optional(),
  completionDate: z.coerce.date({ invalid_type_error: 'Required' }),
});
export const reviewParticipationSchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  pointsEarned: optionalNumber,
});

export const challengeSchema = z.object({
  title: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  categoryId: optionalId,
  xp: z.coerce.number({ invalid_type_error: 'Required' }).int('Whole numbers only').positive('Must be greater than 0'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  evidenceRequired: z.boolean(),
  deadline: z.coerce.date({ invalid_type_error: 'Required' }),
  status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']),
});

export const createChallengeParticipationSchema = z.object({
  challengeId: z.string().trim().min(1, 'Required'),
  proof: z.string().trim().max(2000, 'Too long').optional(),
  progress: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().min(0, 'Min 0').max(100, 'Max 100').optional()
  ),
});
export const reviewChallengeParticipationSchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  xpAwarded: optionalNumber,
});

export const auditSchema = z.object({
  title: z.string().trim().min(1, 'Required').max(120, 'Too long'),
  description: z.string().trim().max(2000, 'Too long').optional(),
  departmentId: optionalId,
  auditor: z.string().trim().max(120, 'Too long').optional(),
  auditDate: z.coerce.date({ invalid_type_error: 'Required' }),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
  findingsSummary: z.string().trim().max(4000, 'Too long').optional(),
});

export const complianceIssueSchema = z.object({
  auditId: z.string().trim().min(1, 'Required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().trim().min(1, 'Required').max(2000, 'Too long'),
  ownerId: z.string().trim().min(1, 'Required'),
  dueDate: z.coerce.date({ invalid_type_error: 'Required' }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const XLSX_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const isXlsxFile = (file) =>
  Boolean(file) &&
  (file.name.toLowerCase().endsWith('.xlsx') || XLSX_MIME_TYPES.includes(file.type));
