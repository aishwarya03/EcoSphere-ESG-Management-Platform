import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertSameOrgUser = async (organizationId, userId) => {
  const user = await prisma.user.findFirst({ where: { id: userId, organizationId } });
  if (!user) {
    throw new AppError('headUserId does not reference a user in this organization', 422);
  }
};

const assertSameOrgDepartment = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('parentDepartmentId does not reference a department in this organization', 422);
  }
};

const withEmployeeCount = (department) => ({
  ...department,
  employeeCount: department._count?.employees ?? undefined,
  _count: undefined,
});

const DEPARTMENT_INCLUDE = {
  head: { select: { id: true, email: true, username: true } },
  parentDepartment: { select: { id: true, name: true, code: true } },
  _count: { select: { employees: true } },
};

export const createDepartment = async ({ organizationId, name, code, headUserId, parentDepartmentId }) => {
  if (headUserId) await assertSameOrgUser(organizationId, headUserId);
  if (parentDepartmentId) await assertSameOrgDepartment(organizationId, parentDepartmentId);

  const existing = await prisma.department.findUnique({
    where: { organizationId_code: { organizationId, code } },
  });
  if (existing) {
    throw new AppError('A department with that code already exists', 409);
  }

  const department = await prisma.department.create({
    data: { organizationId, name, code, headUserId: headUserId ?? null, parentDepartmentId: parentDepartmentId ?? null },
    include: DEPARTMENT_INCLUDE,
  });

  return withEmployeeCount(department);
};

export const listDepartments = async (organizationId) => {
  const departments = await prisma.department.findMany({
    where: { organizationId },
    include: DEPARTMENT_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });

  return departments.map(withEmployeeCount);
};

export const getDepartment = async (organizationId, id) => {
  const department = await prisma.department.findFirst({
    where: { id, organizationId },
    include: DEPARTMENT_INCLUDE,
  });
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  return withEmployeeCount(department);
};

export const updateDepartment = async (organizationId, id, data) => {
  const department = await prisma.department.findFirst({ where: { id, organizationId } });
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  if (data.headUserId) await assertSameOrgUser(organizationId, data.headUserId);
  if (data.parentDepartmentId) {
    if (data.parentDepartmentId === id) {
      throw new AppError('A department cannot be its own parent', 422);
    }
    await assertSameOrgDepartment(organizationId, data.parentDepartmentId);
  }

  if (data.code && data.code !== department.code) {
    const existing = await prisma.department.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });
    if (existing) {
      throw new AppError('A department with that code already exists', 409);
    }
  }

  const updated = await prisma.department.update({
    where: { id },
    data,
    include: DEPARTMENT_INCLUDE,
  });

  return withEmployeeCount(updated);
};
