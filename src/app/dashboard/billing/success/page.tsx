import { prisma } from '@/shared/lib/prisma';
import { PlanType } from '@/features/billing/contracts/billing.dto';
import { stripe } from '@/shared/lib/stripe';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BillingSuccessPage(props: Props) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id as string;

  if (!sessionId) {
    return redirect('/dashboard/billing');
  }

  let customerName = 'Customer';
  let customerEmail = '';

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.customer_details) {
      customerName = session.customer_details.name || 'Customer';
      customerEmail = session.customer_details.email || '';
    }

    // Force DB Sync (Fallback for Webhooks)
    if (session.payment_status === 'paid' && session.metadata?.userId) {
      const userId = session.metadata.userId;
      www;
      const subscriptionId = session.subscription as string;

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: PlanType.PREMIUM,
            stripeCustomerId: session.customer as string,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error retrieving session or syncing DB:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[size:24px_24px]">
      {/* Ambient Emerald Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-900/20 blur-[100px] pointer-events-none" />

      <Card className="max-w-[480px] w-full bg-zinc-950/70 border-zinc-800 p-8 md:p-10 shadow-2xl backdrop-blur-xl relative animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
        {/* Top Highlight Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="flex flex-col items-center text-center">
          {/* Icon Wrapper */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-full flex items-center justify-center shadow-2xl ring-1 ring-emerald-500/20">
              <Check className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] stroke-[3px]" />

              {/* Decorative Sparkles */}
              <Sparkles className="absolute top-0 right-0 w-6 h-6 text-emerald-200 animate-bounce delay-100 opacity-80" />
              <Sparkles className="absolute bottom-2 left-1 w-4 h-4 text-emerald-400 animate-bounce delay-300 opacity-60" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-zinc-400 mb-8">Thank you for your purchase.</p>

          {/* Receipt Card */}
          <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Customer
              </span>
              <span className="text-sm text-zinc-200 font-medium">
                {customerName}
              </span>
            </div>

            {customerEmail && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  Receipt to
                </span>
                <span className="text-sm text-zinc-200 font-medium">
                  {customerEmail}
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400/80 justify-end">
              <Sparkles className="w-3 h-3" />
              <span>Subscription Activated</span>
            </div>
          </div>

          <Button
            asChild
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all group"
          >
            <Link href="/dashboard/billing">
              Return to Dashboard
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
