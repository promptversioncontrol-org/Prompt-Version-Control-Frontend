'use client';

import { useSession } from '@/shared/lib/auth-client';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';

export function EmailVerificationSettings() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    setStatus('sending');
    try {
      const res = await fetch('/api/mail/verification', {
        method: 'POST',
      });
      if (res.ok) {
        setStatus('sent');
        setCountdown(60);
      } else {
        console.error('Failed to send email');
        setStatus('idle');
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  if (!session) return null;

  const isVerified = session.user.emailVerified;

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-white">
              Email Verification
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Manage your email verification status.
            </CardDescription>
          </div>
          {isVerified ? (
            <Badge
              variant="default"
              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
            >
              <AlertCircle className="mr-1 h-3 w-3" /> Not Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isVerified ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              Your email <strong>{session.user.email}</strong> is verified.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Your email <strong>{session.user.email}</strong> is not verified.
              Please verify it to access all features.
            </p>

            <div className="flex flex-col gap-3">
              {status === 'sent' && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Verification email sent! Check your inbox (and spam).
                </div>
              )}

              <Button
                onClick={handleResend}
                disabled={status === 'sending' || countdown > 0}
                variant="outline"
                className="w-full sm:w-auto border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
