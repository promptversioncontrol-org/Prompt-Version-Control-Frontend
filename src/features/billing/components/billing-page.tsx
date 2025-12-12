'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BILLING_PLANS, PlanType } from '../contracts/billing.dto';
import { PricingCard } from './pricing-card';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { createCheckoutSession } from '../actions/create-checkout';

interface OrganizationPlanInfo {
  id: string;
  name: string;
  plan: PlanType;
}

interface BillingPageProps {
  userPlan: PlanType;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  organizations: OrganizationPlanInfo[];
}

export function BillingPage({
  userPlan,
  subscriptionStatus,
  organizations,
}: BillingPageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'organization'>(
    'personal',
  );
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || '',
  );
  const [isLoading, setIsLoading] = useState(false);

  // Derive current status
  const currentOrg = organizations.find((o) => o.id === selectedOrgId);
  const isOrgTab = activeTab === 'organization';
  const currentPlanType = isOrgTab
    ? currentOrg?.plan || PlanType.FREE
    : userPlan;

  // Check if personal premium is active
  const isPersonalPremium = !isOrgTab && userPlan === PlanType.PREMIUM;
  // const isActiveSubscription = isPersonalPremium && subscriptionStatus === 'active';

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Redirecting to checkout...');

    try {
      // Assuming 'personal' tab for now.
      // If org tab, we would need to pass orgId (which we have in selectedOrgId)
      const targetOrgId = isOrgTab ? selectedOrgId : undefined;

      // Get priceId from plan config (we need to ensure it exists or handle it)
      const plan = BILLING_PLANS[planId as PlanType];
      if (!plan.priceId) {
        throw new Error('This plan is not available for online purchase.');
      }

      await createCheckoutSession(plan.priceId, targetOrgId);
    } catch (e: unknown) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : 'Failed to start checkout';
      toast.error(message);
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleManageSubscription = () => {
    // Ideally redirect to Stripe Customer Portal
    toast.info('Manage Subscription Portal coming soon!');
  };

  return (
    <div className="min-h-screen w-full pb-20">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto p-6 sm:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-3 pt-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Billing & Plans
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Manage your subscription, view usage, and upgrade your plan to
            unlock more features.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="personal"
          className="w-full"
          onValueChange={(v) => setActiveTab(v as 'personal' | 'organization')}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <TabsList className="bg-zinc-900/80 border border-zinc-800 p-1 h-12 backdrop-blur-md">
              <TabsTrigger
                value="personal"
                className="h-10 px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 transition-all"
              >
                <User className="w-4 h-4 mr-2" />
                Personal Account
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="h-10 px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 transition-all"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Organization
              </TabsTrigger>
            </TabsList>

            {/* Organization Switcher (Only visible in Org Tab) */}
            <AnimatePresence mode="wait">
              {isOrgTab && organizations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800/50 rounded-lg backdrop-blur-sm overflow-x-auto max-w-full"
                >
                  <span className="text-xs font-medium text-zinc-500 px-2 uppercase tracking-wider">
                    Viewing:
                  </span>
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => setSelectedOrgId(org.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                        selectedOrgId === org.id
                          ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                      )}
                    >
                      {org.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-10">
            {/* Current Plan Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid gap-6 md:grid-cols-3"
            >
              <Card className="col-span-2 relative overflow-hidden bg-zinc-950 border-zinc-800 group">
                {/* Glow Effect */}
                <div
                  className={cn(
                    'absolute top-0 right-0 w-[300px] h-[300px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700',
                    isPersonalPremium
                      ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent'
                      : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent',
                  )}
                />

                <CardHeader className="relative z-10 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                        <CreditCard className="w-5 h-5 text-zinc-400" />
                        Current Subscription
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        {isOrgTab
                          ? `Billing for ${currentOrg?.name}`
                          : 'Your personal account billing'}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-3 py-1 capitalize border-zinc-700',
                        currentPlanType === PlanType.FREE
                          ? 'text-zinc-400 bg-zinc-900'
                          : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                      )}
                    >
                      {currentPlanType} Plan
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
                        {BILLING_PLANS[currentPlanType].name}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        {currentPlanType === PlanType.FREE ? (
                          <span>Upgrade to unlock premium features</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>
                              Status:{' '}
                              <span className="text-white capitalize">
                                {subscriptionStatus || 'Active'}
                              </span>
                            </span>
                            {/* We could calculate renewal date here if we passed it */}
                          </>
                        )}
                      </div>
                    </div>

                    {currentPlanType === PlanType.FREE ? (
                      <Button
                        onClick={() =>
                          document
                            .getElementById('pricing-grid')
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="bg-white text-black hover:bg-zinc-200"
                      >
                        Upgrade Now
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleManageSubscription}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/30 border-zinc-800 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/0 to-zinc-950/0" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h3 className="text-zinc-200 font-medium mb-1">
                    Secure Payment
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4 max-w-[200px] mx-auto">
                    All transactions are encrypted and secured by Stripe.
                  </p>
                  <Button
                    variant="link"
                    className="text-zinc-400 hover:text-white h-auto p-0 text-xs"
                  >
                    Manage Payment Methods &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Pricing Grid - Conditional Rendering */}
            {(!isPersonalPremium || isOrgTab) && (
              <div id="pricing-grid" className="space-y-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold text-white">
                    Available Plans
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <PricingCard
                    plan={BILLING_PLANS[PlanType.FREE]}
                    isCurrent={currentPlanType === PlanType.FREE}
                    onUpgrade={handleUpgrade}
                    isLoading={isLoading}
                    index={0}
                  />

                  {isOrgTab ? (
                    <PricingCard
                      plan={BILLING_PLANS[PlanType.ENTERPRISE]}
                      isCurrent={currentPlanType === PlanType.ENTERPRISE}
                      onUpgrade={handleUpgrade}
                      isLoading={isLoading}
                      index={1}
                    />
                  ) : (
                    <PricingCard
                      plan={BILLING_PLANS[PlanType.PREMIUM]}
                      isCurrent={currentPlanType === PlanType.PREMIUM}
                      onUpgrade={handleUpgrade}
                      isLoading={isLoading}
                      index={1}
                      // Hide button if current or show "Current Plan"
                    />
                  )}
                </div>
              </div>
            )}

            {/* If Premium, show feature summary or usage instead of pricing grid? optional */}
            {isPersonalPremium && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  You have full access!
                </h3>
                <p className="text-zinc-400 text-sm">
                  You are currently exploring the full capabilities of Prompt
                  Version Control.
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
