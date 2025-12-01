import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import WorkspaceOverviewPage from '@/features/workspaces/components/WorkspaceOverviewPage';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function DashboardWorkspacePage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  const { workspaceSlug } = await params;

  // Fetch user to get username
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!user?.username) {
    return <div>Please set a username to view this workspace.</div>;
  }

  return (
    <WorkspaceOverviewPage
      username={user.username}
      workspaceSlug={workspaceSlug}
    />
  );
}
