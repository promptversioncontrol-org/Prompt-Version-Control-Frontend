export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
}

export interface BillingPlanDto {
  id: string; // plan identifier (e.g. 'premium')
  priceId?: string; // Stripe Price ID
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

export const BILLING_PLANS: Record<PlanType, BillingPlanDto> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'Starter',
    price: '$0',
    period: '/month',
    features: [
      '1 User',
      'Basic Pattern Matching (Regex)',
      '3 Days Log Retention',
      'Community Support',
    ],
  },
  [PlanType.PREMIUM]: {
    id: PlanType.PREMIUM,
    // priceId: 'price_1SdQxjRpOpnPbNv7RETcSY5l', // Direct Stripe Price ID
    priceId: 'price_1SdJzK2LYsxu0O2PNGqODkrn', // Direct Stripe Price ID
    name: 'Pro Team',
    price: '$7',
    period: '/month',
    features: [
      'Unlimited Workspaces',
      'Nano OSS Model (Local Analysis)',
      'Bring Your Own Key (OpenAI/Anthropic)',
      '30 Days Log Retention',
      'Priority Support',
      'Access to Telegram Bot',
    ],
    recommended: true,
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited Seats',
      'Custom Fine-tuned Analysis Models',
      'SSO & SAML',
      'Audit Logs Export',
      'Dedicated Success Manager',
      'Organization-wide Premium Access',
    ],
  },
};
