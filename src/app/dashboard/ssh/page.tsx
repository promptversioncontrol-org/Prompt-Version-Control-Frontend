import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { SshKeyManager } from '@/features/dashboard/components/ssh-key-manager';

export default async function SshPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  const keys = await prisma.sshKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">SSH Keys</h1>
        <p className="text-zinc-400">
          Manage your SSH keys for secure access to your workspaces.
        </p>
      </div>

      <SshKeyManager initialKeys={keys} />
    </div>
  );
}
