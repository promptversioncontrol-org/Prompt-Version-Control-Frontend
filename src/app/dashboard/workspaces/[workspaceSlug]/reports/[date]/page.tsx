import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import WorkspaceReportPage from '@/features/workspaces/components/workspace-report-page';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    date: string;
  }>;
}

export default async function DashboardWorkspaceReportPage({
  params,
}: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  const { workspaceSlug, date } = await params;

  // Fetch user to get username
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!user?.username) {
    return <div>Please set a username to view this report.</div>;
  }

  return (
    <WorkspaceReportPage
      username={user.username}
      workspaceSlug={workspaceSlug}
      date={date}
    />
  );
}
