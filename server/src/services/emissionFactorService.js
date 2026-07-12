import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const createEmissionFactor = async ({ organizationId, ...data }) => {
  return prisma.emissionFactor.create({ data: { organizationId, ...data } });
};

export const listEmissionFactors = async (organizationId, filters = {}) => {
  return prisma.emissionFactor.findMany({
    where: {
      organizationId,
      ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getEmissionFactor = async (organizationId, id) => {
  const factor = await prisma.emissionFactor.findFirst({ where: { id, organizationId } });
  if (!factor) {
    throw new AppError('Emission factor not found', 404);
  }
  return factor;
};

export const updateEmissionFactor = async (organizationId, id, data) => {
  const factor = await prisma.emissionFactor.findFirst({ where: { id, organizationId } });
  if (!factor) {
    throw new AppError('Emission factor not found', 404);
  }

  return prisma.emissionFactor.update({ where: { id }, data });
};
