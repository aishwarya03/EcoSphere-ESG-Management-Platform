import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

export const createEnvironmentalGoal = async ({ organizationId, departmentId, ...data }) => {
  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);

  return prisma.environmentalGoal.create({
    data: { organizationId, departmentId: departmentId ?? null, ...data },
  });
};

export const listEnvironmentalGoals = async (organizationId, filters = {}) => {
  return prisma.environmentalGoal.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    },
    include: { department: { select: { id: true, name: true, code: true } } },
    orderBy: { createdAt: 'asc' },
  });
};

export const getEnvironmentalGoal = async (organizationId, id) => {
  const goal = await prisma.environmentalGoal.findFirst({
    where: { id, organizationId },
    include: { department: { select: { id: true, name: true, code: true } } },
  });
  if (!goal) {
    throw new AppError('Environmental goal not found', 404);
  }
  return goal;
};

export const updateEnvironmentalGoal = async (organizationId, id, data) => {
  const goal = await prisma.environmentalGoal.findFirst({ where: { id, organizationId } });
  if (!goal) {
    throw new AppError('Environmental goal not found', 404);
  }

  if (data.departmentId) await assertDepartmentInOrg(organizationId, data.departmentId);

  return prisma.environmentalGoal.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true, code: true } } },
  });
};
