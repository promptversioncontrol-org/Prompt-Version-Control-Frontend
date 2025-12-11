import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import UserWorkspacesPage from '@/features/workspaces/components/user-workspaces-page';

export default async function DashboardWorkspacesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  const { prisma } = await import('@/shared/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!user?.username) {
    return <div>Please set a username to view workspaces.</div>;
  }

  return <UserWorkspacesPage username={user.username} />;
}
