import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const createReward = async ({ organizationId, ...data }) => {
  return prisma.reward.create({ data: { organizationId, ...data } });
};

export const listRewards = async (organizationId, filters = {}) => {
  return prisma.reward.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getReward = async (organizationId, id) => {
  const reward = await prisma.reward.findFirst({ where: { id, organizationId } });
  if (!reward) {
    throw new AppError('Reward not found', 404);
  }
  return reward;
};

export const updateReward = async (organizationId, id, data) => {
  const reward = await prisma.reward.findFirst({ where: { id, organizationId } });
  if (!reward) {
    throw new AppError('Reward not found', 404);
  }

  return prisma.reward.update({ where: { id }, data });
};
