import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';
import { generateInviteToken } from '../utils/token.js';
import { sendInviteEmail } from './emailService.js';

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const buildInviteUrl = (rawToken) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${base}/accept-invite/${rawToken}`;
};

const createPendingUser = async ({ email, organizationId, organizationName }) => {
  const { rawToken, tokenHash } = generateInviteToken();

  const user = await prisma.user.create({
    data: {
      organizationId,
      email,
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

export const inviteSingleUser = async ({ email, organizationId }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('A user with that email already exists', 409);
  }

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const user = await createPendingUser({
    email,
    organizationId,
    organizationName: organization.name,
  });

  return user;
};

export const importUsers = async ({ emails, organizationId }) => {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

  const uniqueEmails = [...new Set(emails.map((e) => e.trim().toLowerCase()))].filter(Boolean);

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: uniqueEmails } },
    select: { email: true },
  });
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  const toInvite = uniqueEmails.filter((email) => !existingEmails.has(email));

  const created = [];
  for (const email of toInvite) {
    const user = await createPendingUser({ email, organizationId, organizationName: organization.name });
    created.push(user);
  }

  return {
    invited: created.map((u) => u.email),
    skipped: uniqueEmails.filter((email) => existingEmails.has(email)),
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
    },
    orderBy: { createdAt: 'asc' },
  });
};
