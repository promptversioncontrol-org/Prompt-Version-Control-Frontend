import { stripe } from '@/shared/lib/stripe';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await stripe.products.list({ limit: 10, active: true });
    const prices = await stripe.prices.list({ limit: 10, active: true });

    return NextResponse.json(
      {
        message: 'Stripe Connectivity Check',
        env_key_prefix: process.env.STRIPE_SECRET_KEY?.slice(0, 8) + '...',
        products: products.data.map((p) => ({
          id: p.id,
          name: p.name,
          livemode: p.livemode,
        })),
        prices: prices.data.map((p) => ({
          id: p.id,
          product: p.product,
          unit_amount: p.unit_amount,
          currency: p.currency,
        })),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorType = (error as any)?.type || 'unknown_type';
    return NextResponse.json(
      {
        error: errorMessage,
        type: errorType,
      },
      { status: 500 },
    );
  }
}
