// Singleton PrismaClient — one connection pool for the process lifetime.
// @prisma/client resolves from root node_modules/ (see docs/TECH_STACK.md).
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
