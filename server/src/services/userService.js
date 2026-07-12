import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';
import { generateInviteToken } from '../utils/token.js';
import { sendInviteEmail } from './emailService.js';

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const buildInviteUrl = (rawToken) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${base}/accept-invite/${rawToken}`;
};

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

const createPendingUser = async ({ email, organizationId, organizationName, departmentId }) => {
  const { rawToken, tokenHash } = generateInviteToken();

  const user = await prisma.user.create({
    data: {
      organizationId,
      email,
      departmentId: departmentId ?? null,
      role: 'EMPLOYEE',
      status: 'PENDING',
      inviteTokenHash: tokenHash,
      inviteTokenExpiresAt: new Date(Date.now() + INVITE_EXPIRY_MS),
    },
  });

  await sendInviteEmail({
    to: email,
    organizationName,
    inviteUrl: buildInviteUrl(rawToken),
  });

  return user;
};

export const inviteSingleUser = async ({ email, organizationId, departmentId }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('A user with that email already exists', 409);
  }

  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const user = await createPendingUser({
    email,
    organizationId,
    organizationName: organization.name,
    departmentId,
  });

  return user;
};

export const importUsers = async ({ rows, organizationId }) => {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const departments = await prisma.department.findMany({
    where: { organizationId },
    select: { id: true, code: true },
  });
  const departmentByCode = new Map(departments.map((d) => [d.code, d.id]));

  const uniqueRows = new Map();
  for (const row of rows) {
    if (!uniqueRows.has(row.email)) uniqueRows.set(row.email, row.departmentCode);
  }

  const emails = [...uniqueRows.keys()];
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  const invited = [];
  const departmentNotFound = [];

  for (const [email, departmentCode] of uniqueRows) {
    if (existingEmails.has(email)) continue;

    let departmentId = null;
    if (departmentCode) {
      departmentId = departmentByCode.get(departmentCode) ?? null;
      if (!departmentId) departmentNotFound.push(email);
    }

    await createPendingUser({ email, organizationId, organizationName: organization.name, departmentId });
    invited.push(email);
  }

  return {
    invited,
    skipped: emails.filter((email) => existingEmails.has(email)),
    departmentNotFound,
  };
};

export const listOrganizationUsers = async (organizationId) => {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      department: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateUser = async (organizationId, userId, data) => {
  const user = await prisma.user.findFirst({ where: { id: userId, organizationId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (data.departmentId) await assertDepartmentInOrg(organizationId, data.departmentId);

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

  return updated;
};

export const getMyProfile = async (organizationId, userId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      department: { select: { id: true, name: true, code: true } },
      organization: { select: { id: true, name: true } },
    },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const csrParticipations = await prisma.employeeParticipation.findMany({
    where: { employeeId: userId },
    select: {
      id: true,
      approvalStatus: true,
      pointsEarned: true,
      completionDate: true,
      submittedAt: true,
      csrActivity: { select: { id: true, title: true, pointsValue: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });

  const challengeParticipations = await prisma.challengeParticipation.findMany({
    where: { employeeId: userId },
    select: {
      id: true,
      progress: true,
      approvalStatus: true,
      xpAwarded: true,
      submittedAt: true,
      challenge: { select: { id: true, title: true, xp: true, deadline: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });

  return { ...user, csrParticipations, challengeParticipations };
};
