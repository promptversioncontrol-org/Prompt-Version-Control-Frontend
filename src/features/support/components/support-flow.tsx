'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  FileTerminal,
  HelpCircle,
  Server,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type SupportStep = 'category' | 'subcategory' | 'details' | 'success';

interface SupportFlowProps {
  email: string;
  onBack: () => void;
  onClose: () => void;
}

// Updated icons to be monochromatic
const CATEGORIES = [
  {
    id: 'cli',
    label: 'CLI Issue',
    icon: FileTerminal,
    description: 'Installation, commands, auth',
    subcategories: [
      { id: 'installation', label: 'Installation' },
      { id: 'authorization', label: 'Authentication' },
      { id: 'command', label: 'Command Execution' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Server,
    description: 'Proxy, connection, latency',
    subcategories: [
      { id: 'proxy', label: 'Proxy / Firewall' },
      { id: 'connection', label: 'Connection Issues' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Billing',
    icon: CreditCard,
    description: 'Plans, payments, organization',
    subcategories: [
      { id: 'billing', label: 'Billing & Invoices' },
      { id: 'organization', label: 'Organization Settings' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
    description: 'Feature requests, bugs',
    subcategories: [],
  },
];

export function SupportFlow({ email, onBack, onClose }: SupportFlowProps) {
  const [step, setStep] = useState<SupportStep>('category');
  const [category, setCategory] = useState<string>('');
  const [subCategory] = useState<string>(''); // Removed unused setSubCategory
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (id: string) => {
    setCategory(id);
    const cat = CATEGORIES.find((c) => c.id === id);
    setStep(cat && cat.subcategories.length > 0 ? 'subcategory' : 'details');
  };

  const handleSubmit = async () => {
    if (!details.trim()) return;
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep('success');
      toast.success('Ticket submitted');
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    if (step === 'category') return 'Select topic';
    if (step === 'subcategory')
      return CATEGORIES.find((c) => c.id === category)?.label;
    if (step === 'details') return 'Details';
    return '';
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.1,
          }}
          className="w-24 h-24 bg-zinc-900/50 border border-zinc-700/50 rounded-full flex items-center justify-center relative ring-1 ring-white/5 shadow-xl"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-50 delay-300" />
          <CheckCircle2
            className="w-10 h-10 text-white relative z-10"
            strokeWidth={1.5}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-3xl font-bold text-white tracking-tight">
            Received.
          </h3>
          <p className="text-zinc-400 text-base leading-relaxed max-w-[280px] mx-auto font-light">
            We&apos;ve sent a confirmation to{' '}
            <span className="text-white font-medium">{email}</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/50 h-12 text-base font-medium rounded-xl transition-all"
          >
            Close
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Clean & Minimal */}
      <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-white/[0.02]">
        {step === 'subcategory' || step === 'details' ? (
          <button
            onClick={() => {
              if (step === 'details')
                setStep(subCategory ? 'subcategory' : 'category');
              if (step === 'subcategory') setStep('category');
            }}
            className="p-2 -ml-2 hover:bg-zinc-800/50 rounded-full text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-zinc-800/50 rounded-full text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-white tracking-tight">
          {getHeaderTitle()}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        <AnimatePresence mode="wait" initial={false}>
          {/* Lists (Categories & Subcategories) */}
          {(step === 'category' || step === 'subcategory') && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-2"
            >
              {(step === 'category'
                ? CATEGORIES
                : CATEGORIES.find((c) => c.id === category)?.subcategories
              )?.map(
                (
                  item: {
                    id: string;
                    label: string;
                    icon?: React.ElementType;
                    description?: string;
                  },
                  i: number,
                ) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() =>
                      step === 'category'
                        ? handleCategorySelect(item.id)
                        : setStep('details')
                    }
                    className="w-full flex items-center gap-5 p-4 rounded-2xl bg-zinc-900/30 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 transition-all text-left group relative overflow-hidden"
                  >
                    {/* Subtle hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {item.icon && (
                      <div className="p-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition-all relative z-10 shadow-sm">
                        <item.icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-zinc-100 group-hover:text-white tracking-tight">
                          {item.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      {item.description && (
                        <p className="text-sm text-zinc-500 group-hover:text-zinc-400 truncate mt-1 font-light">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ),
              )}
            </motion.div>
          )}

          {/* Details Form */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Textarea
                  placeholder="Describe the issue..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full h-full min-h-[250px] bg-zinc-900/50 border-zinc-800 focus:border-white/20 focus:ring-0 text-base resize-none text-white placeholder:text-zinc-600 rounded-2xl p-5 leading-relaxed relative z-10 transition-all"
                  autoFocus
                />
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={!details || isSubmitting}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-base font-semibold rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
