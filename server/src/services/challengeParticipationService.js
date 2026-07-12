import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const INCLUDE = {
  challenge: { select: { id: true, title: true, xp: true, evidenceRequired: true } },
  employee: { select: { id: true, email: true, username: true } },
};

export const createChallengeParticipation = async ({ organizationId, employeeId, challengeId, proof, progress }) => {
  const challenge = await prisma.challenge.findFirst({ where: { id: challengeId, organizationId } });
  if (!challenge) {
    throw new AppError('challengeId does not reference a challenge in this organization', 422);
  }
  if (challenge.status !== 'ACTIVE') {
    throw new AppError('This challenge is not currently open for participation', 422);
  }

  const existing = await prisma.challengeParticipation.findUnique({
    where: { employeeId_challengeId: { employeeId, challengeId } },
  });
  if (existing) {
    throw new AppError('You have already joined this challenge', 409);
  }

  return prisma.challengeParticipation.create({
    data: {
      organizationId,
      employeeId,
      challengeId,
      proof: proof ?? null,
      progress: progress ?? 0,
    },
    include: INCLUDE,
  });
};

export const listChallengeParticipations = async (organizationId, requestingUser, filters = {}) => {
  const isAdmin = requestingUser.role === 'ADMIN';

  return prisma.challengeParticipation.findMany({
    where: {
      organizationId,
      employeeId: isAdmin ? filters.employeeId : requestingUser.sub,
      ...(filters.challengeId ? { challengeId: filters.challengeId } : {}),
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {}),
    },
    include: INCLUDE,
    orderBy: { submittedAt: 'desc' },
  });
};

export const getChallengeParticipation = async (organizationId, requestingUser, id) => {
  const participation = await prisma.challengeParticipation.findFirst({
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

export const updateOwnChallengeParticipation = async (organizationId, employeeId, id, data) => {
  const participation = await prisma.challengeParticipation.findFirst({ where: { id, organizationId } });
  if (!participation) {
    throw new AppError('Participation not found', 404);
  }
  if (participation.employeeId !== employeeId) {
    throw new AppError('You do not have permission to edit this participation', 403);
  }
  if (participation.approvalStatus !== 'PENDING') {
    throw new AppError('Only pending submissions can be edited', 409);
  }

  return prisma.challengeParticipation.update({ where: { id }, data, include: INCLUDE });
};

export const reviewChallengeParticipation = async (
  organizationId,
  reviewerUserId,
  id,
  { approvalStatus, xpAwarded }
) => {
  const participation = await prisma.challengeParticipation.findFirst({
    where: { id, organizationId },
    include: { challenge: true },
  });
  if (!participation) {
    throw new AppError('Participation not found', 404);
  }
  if (participation.approvalStatus !== 'PENDING') {
    throw new AppError('This participation has already been reviewed', 409);
  }

  if (approvalStatus === 'APPROVED' && participation.challenge.evidenceRequired && !participation.proof) {
    throw new AppError('Proof is required before this participation can be approved', 422);
  }

  return prisma.challengeParticipation.update({
    where: { id },
    data: {
      approvalStatus,
      xpAwarded: approvalStatus === 'APPROVED' ? xpAwarded ?? participation.challenge.xp : null,
      reviewedAt: new Date(),
      reviewedByUserId: reviewerUserId,
    },
    include: INCLUDE,
  });
};
