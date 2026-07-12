import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const INCLUDE = {
  csrActivity: { select: { id: true, title: true, pointsValue: true } },
  employee: { select: { id: true, email: true, username: true } },
};

export const createParticipation = async ({ organizationId, employeeId, csrActivityId, proof, completionDate }) => {
  const activity = await prisma.cSRActivity.findFirst({ where: { id: csrActivityId, organizationId } });
  if (!activity) {
    throw new AppError('csrActivityId does not reference a CSR activity in this organization', 422);
  }
  if (activity.status !== 'ACTIVE') {
    throw new AppError('This CSR activity is not open for participation', 422);
  }

  const existing = await prisma.employeeParticipation.findUnique({
    where: { employeeId_csrActivityId: { employeeId, csrActivityId } },
  });
  if (existing) {
    throw new AppError('You have already submitted participation for this activity', 409);
  }

  return prisma.employeeParticipation.create({
    data: { organizationId, employeeId, csrActivityId, proof: proof ?? null, completionDate },
    include: INCLUDE,
  });
};

export const listParticipations = async (organizationId, requestingUser, filters = {}) => {
  const isAdmin = requestingUser.role === 'ADMIN';

  return prisma.employeeParticipation.findMany({
    where: {
      organizationId,
      employeeId: isAdmin ? filters.employeeId : requestingUser.sub,
      ...(filters.csrActivityId ? { csrActivityId: filters.csrActivityId } : {}),
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {}),
    },
    include: INCLUDE,
    orderBy: { submittedAt: 'desc' },
  });
};

export const getParticipation = async (organizationId, requestingUser, id) => {
  const participation = await prisma.employeeParticipation.findFirst({
    where: { id, organizationId },
    include: INCLUDE,
  });
  if (!participation) {
    throw new AppError('Participation not found', 404);
  }
  if (requestingUser.role !== 'ADMIN' && participation.employeeId !== requestingUser.sub) {
    throw new AppError('You do not have permission to view this participation', 403);
  }
  return participation;
};

export const updateOwnParticipation = async (organizationId, employeeId, id, data) => {
  const participation = await prisma.employeeParticipation.findFirst({ where: { id, organizationId } });
  if (!participation) {
    throw new AppError('Participation not found', 404);
  }
  if (participation.employeeId !== employeeId) {
    throw new AppError('You do not have permission to edit this participation', 403);
  }
  if (participation.approvalStatus !== 'PENDING') {
    throw new AppError('Only pending submissions can be edited', 409);
  }

  return prisma.employeeParticipation.update({ where: { id }, data, include: INCLUDE });
};

export const reviewParticipation = async (organizationId, reviewerUserId, id, { approvalStatus, pointsEarned }) => {
  const participation = await prisma.employeeParticipation.findFirst({
    where: { id, organizationId },
    include: { csrActivity: true },
  });
  if (!participation) {
    throw new AppError('Participation not found', 404);
  }
  if (participation.approvalStatus !== 'PENDING') {
    throw new AppError('This participation has already been reviewed', 409);
  }

  if (approvalStatus === 'APPROVED') {
    const esgConfig = await prisma.eSGConfiguration.findUnique({ where: { organizationId } });
    if (esgConfig?.evidenceRequired && !participation.proof) {
      throw new AppError('Proof is required before this participation can be approved', 422);
    }
  }

  return prisma.employeeParticipation.update({
    where: { id },
    data: {
      approvalStatus,
      pointsEarned: approvalStatus === 'APPROVED' ? pointsEarned ?? participation.csrActivity.pointsValue : null,
      reviewedAt: new Date(),
      reviewedByUserId: reviewerUserId,
    },
    include: INCLUDE,
  });
};
