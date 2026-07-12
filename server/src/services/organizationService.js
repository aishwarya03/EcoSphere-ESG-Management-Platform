import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

export const getOrganization = async (organizationId) => {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) {
    throw new AppError('Organization not found', 404);
  }
  return organization;
};

export const updateOrganization = async (organizationId, data) => {
  await getOrganization(organizationId);

  return prisma.organization.update({
    where: { id: organizationId },
    data,
  });
};
