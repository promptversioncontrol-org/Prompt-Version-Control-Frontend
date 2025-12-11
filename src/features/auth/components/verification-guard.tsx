'use client';

import { useSession } from '@/shared/lib/auth-client';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Mail, Loader2, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from '@/shared/lib/auth-client';
import { AuthBackground } from '@/shared/components/ui/auth-background';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils'; // Zakładam, że masz util cn

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [countdown, setCountdown] = useState(0);

  // Obsługa odliczania (Countdown timer)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (isPending) return null; // Opcjonalnie: <FullPageLoader />

  if (!session) {
    return <>{children}</>;
  }

  if (session.user.emailVerified || pathname === '/account-verification') {
    return <>{children}</>;
  }

  const handleResend = async () => {
    setStatus('sending');
    try {
      const res = await fetch('/api/mail/verification', {
        method: 'POST',
      });
      if (res.ok) {
        setStatus('sent');
        setCountdown(60); // Blokada na 60 sekund
      } else {
        console.error('Failed to send email');
        setStatus('idle');
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  return (
    <AuthBackground>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md border-zinc-800/50 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-6 text-center pb-2">
            {/* Ikona z lepszym stylem */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600/20 to-blue-400/5 ring-1 ring-blue-500/20">
              <Mail className="h-10 w-10 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Sprawdź swoją skrzynkę
              </CardTitle>
              <CardDescription className="text-base text-zinc-400">
                Wysłaliśmy link weryfikacyjny na adres:
                <span className="mt-1 block font-medium text-zinc-200">
                  {session.user.email}
                </span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pt-6">
            {/* Feedback message z animacją */}
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 transition-all duration-300',
                status === 'sent'
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-2 hidden',
              )}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>
                Email został wysłany! Sprawdź folder spam, jeśli go nie widzisz.
              </p>
            </div>

            <Button
              onClick={handleResend}
              disabled={status === 'sending' || countdown > 0}
              className="h-11 w-full bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-all"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : countdown > 0 ? (
                `Wyślij ponownie za ${countdown}s`
              ) : (
                'Wyślij ponownie email'
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-zinc-800/50 pt-6">
            <div className="flex w-full items-center justify-between text-sm text-zinc-500">
              <span>Błędny adres email?</span>
              <Button
                variant="link"
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = '/sign-in';
                      },
                    },
                  })
                }
                className="h-auto p-0 text-zinc-400 hover:text-white"
              >
                Wyloguj się
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Opcjonalny footer poza kartą */}
        <p className="mt-8 text-center text-sm text-zinc-600">
          Nie otrzymałeś maila? <br className="sm:hidden" /> Sprawdź folder SPAM
          lub skontaktuj się z supportem.
        </p>
      </div>
    </AuthBackground>
  );
}
