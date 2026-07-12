import crypto from 'crypto';

export const generateInviteToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
};

export const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};
