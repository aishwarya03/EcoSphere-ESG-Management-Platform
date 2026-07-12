import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const getPolicyInOrg = async (organizationId, policyId) => {
  const policy = await prisma.eSGPolicy.findFirst({ where: { id: policyId, organizationId } });
  if (!policy) {
    throw new AppError('ESG policy not found', 404);
  }
  return policy;
};

export const acknowledgePolicy = async (organizationId, employeeId, policyId) => {
  const policy = await getPolicyInOrg(organizationId, policyId);
  if (policy.status !== 'PUBLISHED') {
    throw new AppError('Only published policies can be acknowledged', 422);
  }

  const existing = await prisma.policyAcknowledgement.findUnique({
    where: {
      employeeId_esgPolicyId_policyVersion: {
        employeeId,
        esgPolicyId: policyId,
        policyVersion: policy.version,
      },
    },
  });
  if (existing) {
    throw new AppError('You have already acknowledged this version of the policy', 409);
  }

  return prisma.policyAcknowledgement.create({
    data: {
      organizationId,
      employeeId,
      esgPolicyId: policyId,
      policyVersion: policy.version,
    },
  });
};

export const listAcknowledgements = async (organizationId, policyId) => {
  await getPolicyInOrg(organizationId, policyId);

  return prisma.policyAcknowledgement.findMany({
    where: { esgPolicyId: policyId },
    include: { employee: { select: { id: true, email: true, username: true, departmentId: true } } },
    orderBy: { acknowledgedAt: 'desc' },
  });
};

export const getMyAcknowledgement = async (organizationId, employeeId, policyId) => {
  const policy = await getPolicyInOrg(organizationId, policyId);

  const acknowledgement = await prisma.policyAcknowledgement.findUnique({
    where: {
      employeeId_esgPolicyId_policyVersion: {
        employeeId,
        esgPolicyId: policyId,
        policyVersion: policy.version,
      },
    },
  });

  return {
    currentVersion: policy.version,
    acknowledged: !!acknowledgement,
    acknowledgedAt: acknowledgement?.acknowledgedAt ?? null,
  };
};
