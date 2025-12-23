'use server';

import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import Stripe from 'stripe'; // Import Class
// import { stripe } from '@/shared/lib/stripe'; // Remove singleton
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(priceId: string, orgId?: string) {
  // Initialize Stripe directly to ensure env var is picked up
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine Customer ID
  let customerId = user.stripeCustomerId;

  // Validate existing customer ID if present
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        customerId = null; // treat as missing
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any).code === 'resource_missing') {
        console.warn(
          `Stripe Customer ${customerId} missing, creating new one.`,
        );
        customerId = null;
      } else {
        throw e;
      }
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || user.username || 'User',
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;

    // Save to DB (optional: do this in webhook for strictness, but here is immediate)
    // We try/catch this update to not block checkout if DB is busy,
    // but ideally we persist this mapping.
    try {
      // field might not exist yet
      await prisma.user.update({
        where: { id: user.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { stripeCustomerId: customerId } as any,
      });
    } catch (e) {
      console.warn(
        'Failed to save stripeCustomerId to user (schema might be outdated):',
        e,
      );
    }
  }

  // Resolve Price ID if a Product ID was passed
  let finalPriceId = priceId.trim();
  if (finalPriceId.startsWith('prod_')) {
    try {
      const prices = await stripe.prices.list({
        product: finalPriceId,
        active: true,
        limit: 1,
      });
      if (prices.data.length === 0) {
        throw new Error(`No active price found for this product: ${priceId}`);
      }
      finalPriceId = prices.data[0].id;
    } catch (error: unknown) {
      console.error('Stripe Price Lookup Error:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown Stripe Error';
      throw new Error(`Stripe Error: ${message}`);
    }
  }

  console.log('--- Creating Checkout Session ---');
  console.log('Customer:', customerId);
  console.log('Final Price ID:', finalPriceId);
  console.log('API Key Prefix:', process.env.STRIPE_SECRET_KEY?.slice(0, 8));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: finalPriceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/billing/cancel`,
    metadata: {
      userId: user.id,
      orgId: orgId || '',
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        orgId: orgId || '',
      },
    },
  });

  if (!checkoutSession.url) {
    throw new Error('Failed to create checkout session');
  }

  redirect(checkoutSession.url);
}
