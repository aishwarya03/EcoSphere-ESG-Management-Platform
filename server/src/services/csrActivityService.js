import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertCategoryInOrg = async (organizationId, categoryId) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, organizationId } });
  if (!category) {
    throw new AppError('categoryId does not reference a category in this organization', 422);
  }
  if (category.type !== 'CSR_ACTIVITY') {
    throw new AppError('categoryId must reference a category of type CSR_ACTIVITY', 422);
  }
};

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

export const createCsrActivity = async ({ organizationId, categoryId, departmentId, ...data }) => {
  if (categoryId) await assertCategoryInOrg(organizationId, categoryId);
  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);

  return prisma.cSRActivity.create({
    data: { organizationId, categoryId: categoryId ?? null, departmentId: departmentId ?? null, ...data },
    include: { category: true, department: true },
  });
};

export const listCsrActivities = async (organizationId, filters = {}) => {
  return prisma.cSRActivity.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: { category: true, department: true },
    orderBy: { startDate: 'desc' },
  });
};

export const getCsrActivity = async (organizationId, id) => {
  const activity = await prisma.cSRActivity.findFirst({
    where: { id, organizationId },
    include: { category: true, department: true },
  });
  if (!activity) {
    throw new AppError('CSR activity not found', 404);
  }
  return activity;
};

export const updateCsrActivity = async (organizationId, id, data) => {
  const activity = await prisma.cSRActivity.findFirst({ where: { id, organizationId } });
  if (!activity) {
    throw new AppError('CSR activity not found', 404);
  }

  if (data.categoryId) await assertCategoryInOrg(organizationId, data.categoryId);
  if (data.departmentId) await assertDepartmentInOrg(organizationId, data.departmentId);

  return prisma.cSRActivity.update({
    where: { id },
    data,
    include: { category: true, department: true },
  });
};
