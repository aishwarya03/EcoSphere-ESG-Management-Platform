import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const createCategory = async ({ organizationId, name, type }) => {
  const existing = await prisma.category.findUnique({
    where: { organizationId_name_type: { organizationId, name, type } },
  });
  if (existing) {
    throw new AppError('A category with that name already exists for this type', 409);
  }

  return prisma.category.create({ data: { organizationId, name, type } });
};

export const listCategories = async (organizationId, type) => {
  return prisma.category.findMany({
    where: { organizationId, ...(type ? { type } : {}) },
    orderBy: { createdAt: 'asc' },
  });
};

export const getCategory = async (organizationId, id) => {
  const category = await prisma.category.findFirst({ where: { id, organizationId } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
};

export const updateCategory = async (organizationId, id, data) => {
  const category = await prisma.category.findFirst({ where: { id, organizationId } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { organizationId_name_type: { organizationId, name: data.name, type: category.type } },
    });
    if (existing) {
      throw new AppError('A category with that name already exists for this type', 409);
    }
  }

  return prisma.category.update({ where: { id }, data });
};
