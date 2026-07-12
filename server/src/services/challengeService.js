import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertCategoryInOrg = async (organizationId, categoryId) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, organizationId } });
  if (!category) {
    throw new AppError('categoryId does not reference a category in this organization', 422);
  }
  if (category.type !== 'CHALLENGE') {
    throw new AppError('categoryId must reference a category of type CHALLENGE', 422);
  }
};

export const createChallenge = async ({ organizationId, categoryId, ...data }) => {
  if (categoryId) await assertCategoryInOrg(organizationId, categoryId);

  return prisma.challenge.create({
    data: { organizationId, categoryId: categoryId ?? null, ...data },
    include: { category: true },
  });
};

export const listChallenges = async (organizationId, filters = {}) => {
  return prisma.challenge.findMany({
    where: {
      organizationId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: { category: true },
    orderBy: { deadline: 'asc' },
  });
};

export const getChallenge = async (organizationId, id) => {
  const challenge = await prisma.challenge.findFirst({
    where: { id, organizationId },
    include: { category: true },
  });
  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }
  return challenge;
};

export const updateChallenge = async (organizationId, id, data) => {
  const challenge = await prisma.challenge.findFirst({ where: { id, organizationId } });
  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }

  if (data.categoryId) await assertCategoryInOrg(organizationId, data.categoryId);

  return prisma.challenge.update({
    where: { id },
    data,
    include: { category: true },
  });
};
