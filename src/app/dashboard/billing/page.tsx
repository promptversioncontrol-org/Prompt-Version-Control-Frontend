import { BillingPage } from '@/features/billing/components/billing-page';
import { PlanType } from '@/features/billing/contracts/billing.dto';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Fetch real data if DB is ready, otherwise fallback to mock/safe defaults
  let userPlan = PlanType.FREE;
  let subscriptionStatus: string | undefined = undefined;
  let stripeCustomerId: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const organizations: any[] = [];

  interface UserWithBilling {
    plan?: PlanType;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
  }

  try {
    // Attempt to fetch user plan
    // We wrap in try/catch to ensure page loads even if DB schema isn't fully updated yet.

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
      },
    });

    if (user) {
      const u = user as unknown as UserWithBilling;
      if (u.plan) userPlan = u.plan;
      // Pass other details if needed, but primarily we need subscriptionStatus
      subscriptionStatus = u.subscriptionStatus;
      stripeCustomerId = u.stripeCustomerId;
    }

    // ... organizations ...
  } catch (e) {
    console.error(
      'Failed to fetch billing data (schema might be outdated):',
      e,
    );
    // Fallback to defaults
  }

  return (
    <BillingPage
      userPlan={userPlan}
      subscriptionStatus={subscriptionStatus}
      stripeCustomerId={stripeCustomerId}
      organizations={organizations}
    />
  );
}
