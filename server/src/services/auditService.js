import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

export const createAudit = async ({ organizationId, departmentId, ...data }) => {
  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);

  return prisma.audit.create({
    data: { organizationId, departmentId: departmentId ?? null, ...data },
    include: { department: true },
  });
};

export const listAudits = async (organizationId, filters = {}) => {
  return prisma.audit.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    },
    include: { department: true },
    orderBy: { auditDate: 'desc' },
  });
};

export const getAudit = async (organizationId, id) => {
  const audit = await prisma.audit.findFirst({
    where: { id, organizationId },
    include: { department: true, complianceIssues: true },
  });
  if (!audit) {
    throw new AppError('Audit not found', 404);
  }
  return audit;
};

export const updateAudit = async (organizationId, id, data) => {
  const audit = await prisma.audit.findFirst({ where: { id, organizationId } });
  if (!audit) {
    throw new AppError('Audit not found', 404);
  }

  if (data.departmentId) await assertDepartmentInOrg(organizationId, data.departmentId);

  return prisma.audit.update({ where: { id }, data, include: { department: true } });
};
