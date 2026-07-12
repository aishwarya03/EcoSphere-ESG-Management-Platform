import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertProductInOrg = async (organizationId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, organizationId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

export const createProfile = async (organizationId, productId, data) => {
  await assertProductInOrg(organizationId, productId);

  const latest = await prisma.productEsgProfile.findFirst({
    where: { productId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const { metrics, ...profileData } = data;

  return prisma.productEsgProfile.create({
    data: {
      productId,
      version: nextVersion,
      ...profileData,
      metrics: { create: metrics ?? [] },
    },
    include: { metrics: true },
  });
};

export const listProfiles = async (organizationId, productId) => {
  await assertProductInOrg(organizationId, productId);

  return prisma.productEsgProfile.findMany({
    where: { productId },
    include: { metrics: true },
    orderBy: { version: 'desc' },
  });
};

export const getProfile = async (organizationId, productId, id) => {
  await assertProductInOrg(organizationId, productId);

  const profile = await prisma.productEsgProfile.findFirst({
    where: { id, productId },
    include: { metrics: true },
  });
  if (!profile) {
    throw new AppError('ESG profile not found', 404);
  }
  return profile;
};

export const getCurrentProfile = async (organizationId, productId) => {
  await assertProductInOrg(organizationId, productId);

  const profile = await prisma.productEsgProfile.findFirst({
    where: { productId, status: 'PUBLISHED' },
    include: { metrics: true },
    orderBy: { version: 'desc' },
  });
  if (!profile) {
    throw new AppError('This product has no published ESG profile yet', 404);
  }
  return profile;
};

export const updateProfile = async (organizationId, productId, id, data) => {
  await assertProductInOrg(organizationId, productId);

  const profile = await prisma.productEsgProfile.findFirst({ where: { id, productId } });
  if (!profile) {
    throw new AppError('ESG profile not found', 404);
  }
  if (profile.status === 'PUBLISHED') {
    throw new AppError('A published ESG profile is immutable — create a new version instead', 409);
  }

  const { metrics, ...profileData } = data;

  return prisma.$transaction(async (tx) => {
    if (metrics) {
      await tx.productEsgMetric.deleteMany({ where: { profileId: id } });
    }

    return tx.productEsgProfile.update({
      where: { id },
      data: {
        ...profileData,
        ...(metrics ? { metrics: { create: metrics } } : {}),
      },
      include: { metrics: true },
    });
  });
};
