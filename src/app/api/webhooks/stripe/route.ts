import { headers } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';
import { stripe } from '@/shared/lib/stripe';
import { PlanType } from '@/features/billing/contracts/billing.dto';
import type { Stripe } from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check metadata for userId
    const userId = session.metadata?.userId;

    if (userId && session.payment_status === 'paid') {
      // Update User
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: PlanType.PREMIUM,
          stripeCustomerId: session.customer as string,
          subscriptionStatus: subscription.status,
        },
      });
      console.log(`User ${userId} upgraded to Premium`);
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionId = (invoice as any).subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Ensure we keep the user as active/premium
    if (subscription.status === 'active') {
      const customerId = subscription.customer as string;

      // Find user by stripeCustomerId
      // Note: This assumes stripeCustomerId is unique and linked.
      // Alternatively, use subscription.metadata.userId if we guaranteed it there.
      // We added subscription_data.metadata in create-checkout, so it should be there.
      const userId = subscription.metadata?.userId;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: PlanType.PREMIUM,
            subscriptionStatus: 'active',
          },
        });
        console.log(`User ${userId} subscription renewed`);
      } else if (customerId) {
        // Fallback: update by customer ID
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: PlanType.PREMIUM,
            subscriptionStatus: 'active',
          },
        });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    const customerId = subscription.customer as string;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: PlanType.FREE,
          subscriptionStatus: 'canceled',
        },
      });
      console.log(`User ${userId} subscription canceled`);
    } else if (customerId) {
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: PlanType.FREE,
          subscriptionStatus: 'canceled',
        },
      });
    }
  }

  return new Response(null, { status: 200 });
}
