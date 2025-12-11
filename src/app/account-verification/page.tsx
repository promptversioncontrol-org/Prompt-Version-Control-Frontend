'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/features/auth/actions/verify-email';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AuthBackground } from '@/shared/components/ui/auth-background';

export default function AccountVerificationPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState(
    token ? '' : 'Missing verification token',
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(result.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verify();
  }, [token]);

  return (
    <AuthBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/70 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-zinc-400" />
                <p className="text-zinc-400">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-green-500/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white">Verified!</h3>
                  <p className="text-zinc-400 mt-1">
                    Your email has been successfully verified.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-200 mt-2"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-red-500/10 p-4">
                  <XCircle className="h-12 w-12 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white">
                    Verification Failed
                  </h3>
                  <p className="text-red-400 mt-1">{message}</p>
                </div>
                <Button
                  onClick={() => router.push('/sign-in')}
                  variant="outline"
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthBackground>
  );
}
