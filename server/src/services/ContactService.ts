import { prisma } from '../lib/prisma';
import { upsertPerson } from './PersonService';

interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function createMessage(input: ContactInput) {
  const person = await upsertPerson(input.email, input.name, input.phone);

  const msg = await prisma.contactMessage.create({
    data: {
      personId: person.id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject,
      message: input.message,
      sourceSite: 'health-unveiled',
    },
  });

  // Fire-and-forget — never blocks the response
  if (process.env.NOTIFICATION_EMAIL_ENDPOINT) {
    fetch(process.env.NOTIFICATION_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: input.subject, from: input.email }),
    }).catch((err) => console.error('[contact] notification failed:', err));
  }

  return msg;
}

export async function listMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { person: { select: { id: true, name: true } } },
  });
}

export async function markRead(id: string) {
  return prisma.contactMessage.update({ where: { id }, data: { read: true } });
}
