import prisma from '../prisma/client.js';

export const getOrCreateEsgConfig = async (organizationId) => {
  const existing = await prisma.eSGConfiguration.findUnique({ where: { organizationId } });
  if (existing) return existing;

  return prisma.eSGConfiguration.create({ data: { organizationId } });
};

export const updateEsgConfig = async (organizationId, data) => {
  await getOrCreateEsgConfig(organizationId);

  return prisma.eSGConfiguration.update({
    where: { organizationId },
    data,
  });
};
