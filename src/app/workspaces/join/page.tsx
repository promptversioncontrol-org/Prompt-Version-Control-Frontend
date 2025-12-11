'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { acceptInvitation } from '@/features/workspaces/actions/accept-invitation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function JoinWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'error',
  );
  const [message, setMessage] = useState(
    token
      ? 'Verifying your invitation...'
      : 'Invalid invitation link (missing token).',
  );
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        const result = await acceptInvitation(token);
        if (result.success) {
          setStatus('success');
          setMessage('You have successfully joined the workspace!');
          setWorkspaceSlug(result.workspaceSlug || null);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to join workspace.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred.');
        console.error(err);
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100 text-center">
          Join Workspace
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Checking your invitation details
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 py-6">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-zinc-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-zinc-200 text-center">{message}</p>
            <Button
              className="w-full bg-white text-black hover:bg-zinc-200"
              onClick={() =>
                router.push(
                  workspaceSlug
                    ? `/dashboard/workspaces/${workspaceSlug}`
                    : '/dashboard',
                )
              }
            >
              Go to Workspace
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-400 text-center">{message}</p>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function JoinWorkspacePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
        <JoinWorkspaceContent />
      </Suspense>
    </div>
  );
}
