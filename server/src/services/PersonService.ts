import { prisma } from '../lib/prisma';

export async function upsertPerson(email: string, name?: string, phone?: string) {
  return prisma.person.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase(), name: name ?? null, phone: phone ?? null },
  });
}

export async function listPeople() {
  return prisma.person.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      newsletter: { select: { active: true, subscribedAt: true } },
      _count: { select: { contacts: true, sessions: true } },
    },
  });
}

export async function getPerson(id: string) {
  return prisma.person.findUnique({
    where: { id },
    include: {
      newsletter: true,
      contacts: { orderBy: { createdAt: 'desc' } },
      sessions: {
        where: { revokedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true, createdAt: true, expiresAt: true },
      },
    },
  });
}

export async function updatePerson(
  id: string,
  data: { name?: string; phone?: string; notes?: string; tags?: string[] }
) {
  return prisma.person.update({ where: { id }, data });
}

export async function deletePerson(id: string) {
  return prisma.person.delete({ where: { id } });
}
