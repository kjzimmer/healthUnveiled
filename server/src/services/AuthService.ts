import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import type { AdminPayload } from '../middleware/auth';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

export type LoginResult =
  | { success: true; accessToken: string; refreshToken: string; expiresAt: Date }
  | { success: false; error: string };

export type AuthResult =
  | { success: true; accessToken: string }
  | { success: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const person = await prisma.person.findUnique({ where: { email: email.toLowerCase() } });

  if (!person?.isAdmin || !person.passwordHash) {
    return { success: false, error: 'Invalid credentials' };
  }

  const valid = await bcrypt.compare(password, person.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid credentials' };
  }

  if (person.totpEnabled) {
    return { success: false, error: 'TOTP is enabled on this account but not configured on this server' };
  }

  const payload: AdminPayload = { sub: person.id, email: person.email, isAdmin: true };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });

  const rawRefresh = crypto.randomBytes(64).toString('hex');
  const tokenHash = await bcrypt.hash(rawRefresh, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { personId: person.id, tokenHash, expiresAt } });

  return { success: true, accessToken, refreshToken: rawRefresh, expiresAt };
}

export async function refresh(rawToken: string): Promise<AuthResult> {
  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() }, revokedAt: null },
    include: { person: true },
  });

  let matched: (typeof tokens)[number] | null = null;
  for (const token of tokens) {
    if (await bcrypt.compare(rawToken, token.tokenHash)) {
      matched = token;
      break;
    }
  }

  if (!matched || !matched.person.isAdmin) {
    return { success: false, error: 'Invalid refresh token' };
  }

  const payload: AdminPayload = { sub: matched.person.id, email: matched.person.email, isAdmin: true };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });

  return { success: true, accessToken };
}

export async function logout(personId: string, rawToken: string): Promise<void> {
  const tokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null, personId },
  });

  for (const token of tokens) {
    if (await bcrypt.compare(rawToken, token.tokenHash)) {
      await prisma.refreshToken.update({ where: { id: token.id }, data: { revokedAt: new Date() } });
    }
  }
}
