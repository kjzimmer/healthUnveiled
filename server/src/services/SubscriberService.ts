// Subscriber persistence — rewritten in Phase 3 for Person-as-hub schema.
import { prisma } from '../lib/prisma';

export type SubscribeResult =
  | { success: true }
  | { success: false; error: string };

export async function subscribe(email: string): Promise<SubscribeResult> {
  try {
    const person = await prisma.person.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });

    await prisma.newsletterSubscriber.upsert({
      where: { personId: person.id },
      update: { active: true },
      create: {
        personId: person.id,
        sourceSite: 'health-unveiled',
      },
    });

    return { success: true };
  } catch (err) {
    console.error('[SubscriberService] failed:', err);
    return { success: false, error: 'Database error' };
  }
}
