import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const INCLUDE = {
  audit: { select: { id: true, title: true } },
  owner: { select: { id: true, email: true, username: true } },
};

const assertAuditInOrg = async (organizationId, auditId) => {
  const audit = await prisma.audit.findFirst({ where: { id: auditId, organizationId } });
  if (!audit) {
    throw new AppError('auditId does not reference an audit in this organization', 422);
  }
};

const assertOwnerInOrg = async (organizationId, ownerId) => {
  const owner = await prisma.user.findFirst({ where: { id: ownerId, organizationId } });
  if (!owner) {
    throw new AppError('ownerId does not reference a user in this organization', 422);
  }
};

export const createComplianceIssue = async ({ organizationId, auditId, ownerId, ...data }) => {
  await assertAuditInOrg(organizationId, auditId);
  await assertOwnerInOrg(organizationId, ownerId);

  return prisma.complianceIssue.create({
    data: { organizationId, auditId, ownerId, ...data },
    include: INCLUDE,
  });
};

export const listComplianceIssues = async (organizationId, filters = {}) => {
  return prisma.complianceIssue.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.severity ? { severity: filters.severity } : {}),
      ...(filters.auditId ? { auditId: filters.auditId } : {}),
      ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
      ...(filters.overdue
        ? { dueDate: { lt: new Date() }, status: { in: ['OPEN', 'IN_PROGRESS'] } }
        : {}),
    },
    include: INCLUDE,
    orderBy: { dueDate: 'asc' },
  });
};

export const getComplianceIssue = async (organizationId, id) => {
  const issue = await prisma.complianceIssue.findFirst({
    where: { id, organizationId },
    include: INCLUDE,
  });
  if (!issue) {
    throw new AppError('Compliance issue not found', 404);
  }
  return issue;
};

export const updateComplianceIssue = async (organizationId, id, data) => {
  const issue = await prisma.complianceIssue.findFirst({ where: { id, organizationId } });
  if (!issue) {
    throw new AppError('Compliance issue not found', 404);
  }

  if (data.ownerId) await assertOwnerInOrg(organizationId, data.ownerId);

  return prisma.complianceIssue.update({ where: { id }, data, include: INCLUDE });
};
