'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { useSession } from '@/shared/lib/auth-client';
import { MessageSquare, X, ChevronDown } from 'lucide-react';
import { SupportFlow } from './support-flow';
import { cn } from '@/shared/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function SupportWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasEnteredEmail, setHasEnteredEmail] = useState(false);

  useEffect(() => {
    if (
      session?.user?.email &&
      !hasEnteredEmail &&
      email !== session.user.email
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(session.user.email);
      setHasEnteredEmail(true);
    }
  }, [session, hasEnteredEmail, email]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) setHasEnteredEmail(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
      {/* Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="w-[400px] h-[550px] origin-bottom-right"
          >
            {/* Glass Card with Neon Border */}
            <Card className="w-full h-full border border-zinc-800 bg-zinc-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col relative ring-1 ring-white/5">
              {/* Subtle Top Glow */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />

              {/* Close Button */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={toggleOpen}
                  className="p-2 hover:bg-zinc-800/80 rounded-full text-zinc-400 hover:text-white transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!hasEnteredEmail ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 relative overflow-hidden">
                  {/* Icon with subtle glow */}
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-20 h-20 bg-zinc-900/80 border border-zinc-700/50 rounded-2xl flex items-center justify-center shadow-xl relative z-10 ring-1 ring-white/10">
                      <MessageSquare
                        className="w-10 h-10 text-zinc-100"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Support
                    </h3>
                    <p className="text-base text-zinc-400 max-w-[260px] mx-auto leading-relaxed font-light">
                      Enter your email to connect with our team.
                    </p>
                  </div>

                  <form
                    onSubmit={handleEmailSubmit}
                    className="w-full space-y-4 relative z-10"
                  >
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 focus:ring-zinc-700/30 text-white placeholder:text-zinc-600 h-12 text-base rounded-xl transition-all"
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue
                    </Button>
                  </form>
                </div>
              ) : (
                <SupportFlow
                  email={email}
                  onBack={() => setHasEnteredEmail(false)}
                  onClose={toggleOpen}
                />
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button - Neon Style */}
      <motion.button
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'h-14 w-14 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center border transition-all duration-300 relative z-50 overflow-hidden group',
          isOpen
            ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
            : 'bg-white border-white/20 text-black hover:bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.15)]',
        )}
      >
        {/* Subtle glow effect on hover when closed */}
        {!isOpen && (
          <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <MessageSquare className="w-6 h-6" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
