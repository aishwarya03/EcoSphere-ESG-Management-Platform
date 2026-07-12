import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';
import { hashToken } from '../utils/token.js';

const PASSWORD_SALT_ROUNDS = 12;

const signToken = (user) => {
  return jwt.sign(
    { sub: user.id, organizationId: user.organizationId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const toPublicUser = (user) => ({
  id: user.id,
  organizationId: user.organizationId,
  email: user.email,
  username: user.username,
  role: user.role,
  status: user.status,
});

export const registerOrganization = async ({ organizationName, name, email, username, password }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new AppError('An account with that email or username already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const { organization, user } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        email,
        username,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    await tx.eSGConfiguration.create({
      data: { organizationId: organization.id },
    });

    return { organization, user };
  });

  const token = signToken(user);
  return { token, user: toPublicUser(user), organization };
};

export const login = async ({ identifier, password }) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }
  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is not active', 403);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken(user);
  return { token, user: toPublicUser(user) };
};

export const getInvitePreview = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const user = await prisma.user.findUnique({
    where: { inviteTokenHash: tokenHash },
    include: { organization: true },
  });

  if (!user || user.status !== 'PENDING' || user.inviteTokenExpiresAt < new Date()) {
    throw new AppError('Invite link is invalid or has expired', 400);
  }

  return {
    email: user.email,
    organizationName: user.organization.name,
  };
};

export const acceptInvite = async (rawToken, { username, password }) => {
  const tokenHash = hashToken(rawToken);

  const user = await prisma.user.findUnique({ where: { inviteTokenHash: tokenHash } });
  if (!user || user.status !== 'PENDING' || user.inviteTokenExpiresAt < new Date()) {
    throw new AppError('Invite link is invalid or has expired', 400);
  }

  const usernameTaken = await prisma.user.findFirst({
    where: { username, NOT: { id: user.id } },
  });
  if (usernameTaken) {
    throw new AppError('That username is already taken', 409);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      passwordHash,
      status: 'ACTIVE',
      inviteTokenHash: null,
      inviteTokenExpiresAt: null,
      lastLoginAt: new Date(),
    },
  });

  const token = signToken(updated);
  return { token, user: toPublicUser(updated) };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { user: toPublicUser(user), organization: user.organization };
};
