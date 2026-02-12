'use server';

import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { stripe } from '@/shared/lib/stripe';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function resumeSubscription() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.stripeCustomerId) {
    throw new Error('No subscription found');
  }

  try {
    // 1. Find the subscription (even if it's set to cancel)
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active', // It's still active until period end
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found to resume');
    }

    const subscriptionId = subscriptions.data[0].id;

    // 2. Resume (Don't cancel at period end)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // 3. Update DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'active',
      },
    });

    revalidatePath('/dashboard/billing');
    return { success: true };
  } catch (error: unknown) {
    console.error('Resume Subscription Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(message);
  }
}
