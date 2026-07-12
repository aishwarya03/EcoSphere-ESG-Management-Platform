import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const createEsgPolicy = async ({ organizationId, ...data }) => {
  return prisma.eSGPolicy.create({ data: { organizationId, ...data } });
};

export const listEsgPolicies = async (organizationId, filters = {}) => {
  return prisma.eSGPolicy.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getEsgPolicy = async (organizationId, id) => {
  const policy = await prisma.eSGPolicy.findFirst({ where: { id, organizationId } });
  if (!policy) {
    throw new AppError('ESG policy not found', 404);
  }
  return policy;
};

export const updateEsgPolicy = async (organizationId, id, data) => {
  const policy = await prisma.eSGPolicy.findFirst({ where: { id, organizationId } });
  if (!policy) {
    throw new AppError('ESG policy not found', 404);
  }

  const contentChanged =
    (data.title !== undefined && data.title !== policy.title) ||
    (data.description !== undefined && data.description !== policy.description);

  return prisma.eSGPolicy.update({
    where: { id },
    data: {
      ...data,
      ...(contentChanged ? { version: policy.version + 1 } : {}),
    },
  });
};
