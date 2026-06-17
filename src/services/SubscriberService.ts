// Subscriber persistence — wraps all database interactions for the People table.
import { prisma } from '../db';

export type SubscribeResult =
  | { success: true }
  | { success: false; error: string };

export async function subscribe(email: string): Promise<SubscribeResult> {
  try {
    await prisma.people.upsert({
      where: { email },
      create: { email },
      update: { status: 'SUBSCRIBED' },
    });
    return { success: true };
  } catch (err) {
    console.error('[SubscriberService] upsert failed:', err);
    return { success: false, error: 'Database error' };
  }
}
