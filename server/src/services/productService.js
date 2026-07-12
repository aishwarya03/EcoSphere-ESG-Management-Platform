import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertCategoryInOrg = async (organizationId, categoryId) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, organizationId } });
  if (!category) {
    throw new AppError('categoryId does not reference a category in this organization', 422);
  }
  if (category.type !== 'PRODUCT') {
    throw new AppError('categoryId must reference a category of type PRODUCT', 422);
  }
};

export const createProduct = async ({ organizationId, name, code, type, categoryId, description }) => {
  if (categoryId) await assertCategoryInOrg(organizationId, categoryId);

  const existing = await prisma.product.findUnique({
    where: { organizationId_code: { organizationId, code } },
  });
  if (existing) {
    throw new AppError('A product with that code already exists', 409);
  }

  return prisma.product.create({
    data: { organizationId, name, code, type, categoryId: categoryId ?? null, description: description ?? null },
    include: { category: true },
  });
};

export const listProducts = async (organizationId, filters = {}) => {
  return prisma.product.findMany({
    where: {
      organizationId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });
};

export const getProduct = async (organizationId, id) => {
  const product = await prisma.product.findFirst({
    where: { id, organizationId },
    include: { category: true },
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

export const updateProduct = async (organizationId, id, data) => {
  const product = await prisma.product.findFirst({ where: { id, organizationId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (data.categoryId) await assertCategoryInOrg(organizationId, data.categoryId);

  if (data.code && data.code !== product.code) {
    const existing = await prisma.product.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });
    if (existing) {
      throw new AppError('A product with that code already exists', 409);
    }
  }

  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
};
