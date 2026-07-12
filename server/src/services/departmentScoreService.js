import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const SEVERITY_PENALTY = { LOW: 2, MEDIUM: 5, HIGH: 10, CRITICAL: 20 };

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const computeEnvironmentalScore = async (organizationId, department) => {
  const emissions = await prisma.carbonTransaction.aggregate({
    where: { organizationId, departmentId: department.id },
    _sum: { calculatedEmissionsKgCo2e: true },
  });
  const actual = emissions._sum.calculatedEmissionsKgCo2e ?? 0;

  const goal =
    (await prisma.environmentalGoal.findFirst({
      where: { organizationId, departmentId: department.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })) ??
    (await prisma.environmentalGoal.findFirst({
      where: { organizationId, departmentId: null, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    }));

  if (!goal) return 100;

  if (goal.baselineValue == null || goal.baselineValue <= goal.targetValue) {
    return actual <= goal.targetValue ? 100 : 0;
  }

  const progress = (goal.baselineValue - actual) / (goal.baselineValue - goal.targetValue);
  return clamp(progress * 100);
};

const computeSocialScore = async (organizationId, department) => {
  const employees = await prisma.user.findMany({
    where: { organizationId, departmentId: department.id },
    select: { id: true },
  });
  const employeeIds = employees.map((e) => e.id);
  if (employeeIds.length === 0) return 100;

  const csrApproved = await prisma.employeeParticipation.findMany({
    where: { employeeId: { in: employeeIds }, approvalStatus: 'APPROVED' },
    select: { employeeId: true },
    distinct: ['employeeId'],
  });
  const challengeApproved = await prisma.challengeParticipation.findMany({
    where: { employeeId: { in: employeeIds }, approvalStatus: 'APPROVED' },
    select: { employeeId: true },
    distinct: ['employeeId'],
  });

  const csrRate = (csrApproved.length / employeeIds.length) * 100;
  const challengeRate = (challengeApproved.length / employeeIds.length) * 100;

  return (csrRate + challengeRate) / 2;
};

const computeGovernanceScore = async (organizationId, department) => {
  const employees = await prisma.user.findMany({
    where: { organizationId, departmentId: department.id },
    select: { id: true },
  });
  const employeeIds = employees.map((e) => e.id);

  const publishedPolicies = await prisma.eSGPolicy.findMany({
    where: { organizationId, status: 'PUBLISHED' },
    select: { id: true, version: true },
  });

  let ackRate = 100;
  if (employeeIds.length > 0 && publishedPolicies.length > 0) {
    let achieved = 0;
    for (const policy of publishedPolicies) {
      achieved += await prisma.policyAcknowledgement.count({
        where: { employeeId: { in: employeeIds }, esgPolicyId: policy.id, policyVersion: policy.version },
      });
    }
    ackRate = (achieved / (employeeIds.length * publishedPolicies.length)) * 100;
  }

  const overdueIssues = await prisma.complianceIssue.findMany({
    where: {
      organizationId,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      dueDate: { lt: new Date() },
      audit: { departmentId: department.id },
    },
    select: { severity: true },
  });
  const penalty = overdueIssues.reduce((sum, issue) => sum + (SEVERITY_PENALTY[issue.severity] ?? 0), 0);
  const complianceScore = clamp(100 - penalty);

  return (ackRate + complianceScore) / 2;
};

const computeDepartmentScore = async (organizationId, department, weights) => {
  const [environmentalScore, socialScore, governanceScore] = await Promise.all([
    computeEnvironmentalScore(organizationId, department),
    computeSocialScore(organizationId, department),
    computeGovernanceScore(organizationId, department),
  ]);

  const totalScore =
    (environmentalScore * weights.environmentalWeight) / 100 +
    (socialScore * weights.socialWeight) / 100 +
    (governanceScore * weights.governanceWeight) / 100;

  return { environmentalScore, socialScore, governanceScore, totalScore };
};

export const recomputeDepartmentScores = async (organizationId, departmentId) => {
  const weights = await prisma.eSGConfiguration.findUnique({ where: { organizationId } });

  const departments = await prisma.department.findMany({
    where: { organizationId, ...(departmentId ? { id: departmentId } : {}) },
  });
  if (departmentId && departments.length === 0) {
    throw new AppError('Department not found', 404);
  }

  const results = [];
  for (const department of departments) {
    const scores = await computeDepartmentScore(organizationId, department, weights);
    const record = await prisma.departmentScore.create({
      data: { organizationId, departmentId: department.id, ...scores },
      include: { department: { select: { id: true, name: true, code: true } } },
    });
    results.push(record);
  }

  return results;
};

export const listLatestDepartmentScores = async (organizationId) => {
  const departments = await prisma.department.findMany({ where: { organizationId } });

  const latestScores = await Promise.all(
    departments.map((department) =>
      prisma.departmentScore.findFirst({
        where: { organizationId, departmentId: department.id },
        orderBy: { computedAt: 'desc' },
        include: { department: { select: { id: true, name: true, code: true } } },
      })
    )
  );

  return latestScores.filter(Boolean);
};

export const getDepartmentScoreHistory = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  return prisma.departmentScore.findMany({
    where: { organizationId, departmentId },
    orderBy: { computedAt: 'desc' },
  });
};

export const getOverallEsgScore = async (organizationId) => {
  const latestScores = await listLatestDepartmentScores(organizationId);
  if (latestScores.length === 0) {
    throw new AppError('No department scores have been computed yet', 404);
  }

  const departmentIds = latestScores.map((s) => s.departmentId);
  const employeeCounts = await prisma.user.groupBy({
    by: ['departmentId'],
    where: { organizationId, departmentId: { in: departmentIds } },
    _count: { id: true },
  });
  const countByDept = new Map(employeeCounts.map((e) => [e.departmentId, e._count.id]));

  const totalEmployees = latestScores.reduce((sum, s) => sum + (countByDept.get(s.departmentId) ?? 0), 0);

  const overallScore =
    totalEmployees > 0
      ? latestScores.reduce(
          (sum, s) => sum + s.totalScore * (countByDept.get(s.departmentId) ?? 0),
          0
        ) / totalEmployees
      : latestScores.reduce((sum, s) => sum + s.totalScore, 0) / latestScores.length;

  return {
    overallScore,
    departmentScores: latestScores.map((s) => ({
      departmentId: s.departmentId,
      departmentName: s.department.name,
      totalScore: s.totalScore,
      employeeCount: countByDept.get(s.departmentId) ?? 0,
      computedAt: s.computedAt,
    })),
  };
};
