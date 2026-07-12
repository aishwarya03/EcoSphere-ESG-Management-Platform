import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const createBadge = async ({ organizationId, ...data }) => {
  const existing = await prisma.badge.findUnique({
    where: { organizationId_name: { organizationId, name: data.name } },
  });
  if (existing) {
    throw new AppError('A badge with that name already exists', 409);
  }

  return prisma.badge.create({ data: { organizationId, ...data } });
};

export const listBadges = async (organizationId, filters = {}) => {
  return prisma.badge.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getBadge = async (organizationId, id) => {
  const badge = await prisma.badge.findFirst({ where: { id, organizationId } });
  if (!badge) {
    throw new AppError('Badge not found', 404);
  }
  return badge;
};

export const updateBadge = async (organizationId, id, data) => {
  const badge = await prisma.badge.findFirst({ where: { id, organizationId } });
  if (!badge) {
    throw new AppError('Badge not found', 404);
  }

  if (data.name && data.name !== badge.name) {
    const existing = await prisma.badge.findUnique({
      where: { organizationId_name: { organizationId, name: data.name } },
    });
    if (existing) {
      throw new AppError('A badge with that name already exists', 409);
    }
  }

  return prisma.badge.update({ where: { id }, data });
};
