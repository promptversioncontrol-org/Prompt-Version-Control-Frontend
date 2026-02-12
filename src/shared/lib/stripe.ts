import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Warn but don't crash, in case we are in build time or client side (though this file should be server-only)
  // We throw error only when attempting to use it.
  console.warn(
    'Missing STRIPE_SECRET_KEY environment variable. Billing features will not work.',
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2024-12-18.acacia', // Latest or pinned version
  typescript: true,
});
