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
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { createCheckoutSession } from '../actions/create-checkout';
import { cancelSubscription } from '../actions/cancel-subscription';
import { resumeSubscription } from '../actions/resume-subscription';

interface OrganizationPlanInfo {
  id: string;
  name: string;
  plan: PlanType;
}

interface BillingPageProps {
  userPlan: PlanType;
  subscriptionStatus?: string;
  currentPeriodEnd?: Date;
  organizations: OrganizationPlanInfo[];
}

export function BillingPage({
  userPlan,
  subscriptionStatus,
  currentPeriodEnd,
  organizations,
}: BillingPageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'organization'>(
    'personal',
  );
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id || '',
  );
  const [isLoading, setIsLoading] = useState(false);

  // Cancel Dialog State
  const [cancelConfirmation, setCancelConfirmation] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const currentOrg = organizations.find((o) => o.id === selectedOrgId);
  const isOrgTab = activeTab === 'organization';
  const currentPlanType = isOrgTab
    ? currentOrg?.plan || PlanType.FREE
    : userPlan;
  const isPersonalPremium = !isOrgTab && userPlan === PlanType.PREMIUM;

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Redirecting to checkout...');

    try {
      const targetOrgId = isOrgTab ? selectedOrgId : undefined;
      const plan = BILLING_PLANS[planId as PlanType];
      if (!plan.priceId) throw new Error('Plan not available for purchase.');
      await createCheckoutSession(plan.priceId, targetOrgId);
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to start checkout');
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      toast.success('Subscription cancelled. Access remains until period end.');
      setIsCancelDialogOpen(false);
    } catch (e) {
      toast.error('Failed to cancel subscription');
      console.error(e);
    } finally {
      setIsLoading(false);
      setCancelConfirmation('');
    }
  };

  const handleResumeSubscription = async () => {
    setIsLoading(true);
    try {
      await resumeSubscription();
      toast.success('Subscription resumed successfully!');
    } catch (e) {
      toast.error('Failed to resume subscription');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full pb-20 bg-black">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto p-6 sm:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-3 pt-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Billing & Plans
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Manage your subscription, view usage, and upgrade your plan.
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
                <User className="w-4 h-4 mr-2" /> Personal Account
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="h-10 px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 transition-all"
              >
                <Building2 className="w-4 h-4 mr-2" /> Organization
              </TabsTrigger>
            </TabsList>

            {/* Org Switcher */}
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
            {/* Current Plan Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid gap-6 md:grid-cols-3"
            >
              <Card className="col-span-2 relative overflow-hidden bg-zinc-950 border-zinc-800 group">
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
                        <CreditCard className="w-5 h-5 text-zinc-400" /> Current
                        Subscription
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
                      <div className="text-sm text-zinc-400 flex flex-col gap-1">
                        {currentPlanType === PlanType.FREE ? (
                          <span>Upgrade to unlock premium features</span>
                        ) : (
                          <>
                            {subscriptionStatus === 'canceled' ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-amber-500">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="font-medium">
                                    Subscription Canceled
                                  </span>
                                </div>
                                {currentPeriodEnd && (
                                  <div className="text-xs text-zinc-400 ml-6">
                                    Access remains until:{' '}
                                    <span className="text-zinc-200">
                                      {currentPeriodEnd.toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span>
                                    Status:{' '}
                                    <span
                                      className={cn(
                                        'capitalize',
                                        subscriptionStatus === 'active'
                                          ? 'text-white'
                                          : 'text-zinc-300',
                                      )}
                                    >
                                      {subscriptionStatus || 'Active'}
                                    </span>
                                  </span>
                                </div>
                                {currentPeriodEnd && (
                                  <div className="text-zinc-500 text-xs ml-6">
                                    Next billing:{' '}
                                    <span className="text-zinc-300">
                                      {currentPeriodEnd.toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
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
                    ) : subscriptionStatus === 'canceled' ? (
                      <Button
                        onClick={handleResumeSubscription}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          'Resume Subscription'
                        )}
                      </Button>
                    ) : (
                      <AlertDialog
                        open={isCancelDialogOpen}
                        onOpenChange={setIsCancelDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={
                              isLoading || subscriptionStatus === 'canceled'
                            }
                            className="border-zinc-700 hover:bg-red-900/50 hover:text-red-200 bg-transparent text-zinc-400 border"
                          >
                            {subscriptionStatus === 'canceled'
                              ? 'Cancellation Scheduled'
                              : 'Cancel Subscription'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                          <AlertDialogHeader>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mb-4 mx-auto">
                              <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <AlertDialogTitle className="text-center text-white">
                              Cancel Subscription?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-zinc-400">
                              This action will cancel your subscription at the
                              end of the current billing period. You will lose
                              access to premium features after that date.
                              <br />
                              <br />
                              To confirm, type{' '}
                              <strong>cancel subscription</strong> below:
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <div className="py-4">
                            <Input
                              placeholder="cancel subscription"
                              value={cancelConfirmation}
                              onChange={(e) =>
                                setCancelConfirmation(e.target.value)
                              }
                              className="bg-zinc-900 border-zinc-700 text-center text-white focus:border-red-500/50 focus:ring-red-500/20"
                            />
                          </div>

                          <AlertDialogFooter className="sm:justify-center gap-2">
                            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">
                              Nevermind
                            </AlertDialogCancel>
                            <Button
                              variant="destructive"
                              onClick={handleCancelSubscription}
                              disabled={
                                cancelConfirmation.toLowerCase() !==
                                  'cancel subscription' || isLoading
                              }
                              className="bg-red-600 hover:bg-red-700 text-white border-0 min-w-[140px]"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Confirm Cancellation'
                              )}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Secure Payment Card (Keep existing) */}
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
                    Encrypted and secured by Stripe.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Pricing Grid */}
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
                    />
                  )}
                </div>
              </div>
            )}

            {isPersonalPremium && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-1">
                    You have full access!
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    You are currently exploring the full capabilities of Prompt
                    Version Control.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
