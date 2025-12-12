'use client';

import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { BillingPlanDto } from '../contracts/billing.dto';

interface PricingCardProps {
  plan: BillingPlanDto;
  isCurrent?: boolean;
  onUpgrade?: (planId: string) => void;
  isLoading?: boolean;
  index?: number;
}

export function PricingCard({
  plan,
  isCurrent,
  onUpgrade,
  isLoading,
  index = 0,
}: PricingCardProps) {
  const isRecommended = plan.recommended;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative flex flex-col h-full transition-all duration-300 overflow-visible',
          // Base styles
          'bg-zinc-950/80 backdrop-blur-sm border-zinc-800',
          // Recommended styles
          isRecommended
            ? 'border-zinc-700 shadow-[0_0_40px_rgba(255,255,255,0.03)]'
            : 'hover:border-zinc-700 hover:bg-zinc-900/80',
        )}
      >
        {/* Recommended Glow Border Effect */}
        {isRecommended && (
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none p-[1px] -z-10"
            aria-hidden="true"
          />
        )}

        {isRecommended && (
          <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
            <div className="px-3 py-1 bg-white text-black text-[11px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] ring-4 ring-black">
              Most Popular
            </div>
          </div>
        )}

        <CardHeader className="pb-4 pt-6">
          <div className="space-y-2">
            <h3
              className={cn(
                'text-lg font-medium',
                isRecommended ? 'text-white' : 'text-zinc-200',
              )}
            >
              {plan.name}
            </h3>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tight">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-zinc-500 font-medium ml-1">
                  /{plan.period}
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-400 min-h-[40px] pt-2">
              Perfect for{' '}
              {plan.id === 'free'
                ? 'hobbyists and side projects'
                : plan.id === 'premium'
                  ? 'growing teams and startups'
                  : 'large scale organizations'}
              .
            </p>
          </div>
        </CardHeader>

        <div className="px-6 py-2">
          <div className="h-px w-full bg-zinc-800/50" />
        </div>

        <CardContent className="flex-1 pt-4">
          <ul className="space-y-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div
                  className={cn(
                    'mt-0.5 min-w-4 max-w-4 flex items-center justify-center rounded-full h-4 w-4',
                    isRecommended
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-zinc-400',
                  )}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span
                  className={cn(
                    'leading-tight',
                    isRecommended ? 'text-zinc-300' : 'text-zinc-400',
                  )}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6 pb-6">
          <Button
            onClick={() => onUpgrade?.(plan.id)}
            disabled={isCurrent || isLoading}
            className={cn(
              'w-full h-11 font-medium transition-all duration-300',
              isCurrent
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-default hover:bg-zinc-900 opacity-80'
                : isRecommended
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02]'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white',
            )}
          >
            {isCurrent ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Current Plan
              </span>
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Plan'}
                {plan.id !== 'enterprise' && <ArrowRight className="w-4 h-4" />}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
