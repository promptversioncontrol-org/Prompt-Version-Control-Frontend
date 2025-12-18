import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import WorkspaceOverviewPage from '@/features/workspaces/components/workspace-overview-page';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function DashboardWorkspacePage({ params }: PageProps) {
  let session;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Failed to get session (DB Error possibly):', error);
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#09090b] text-white">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold">System Unavailable</h1>
        <p className="text-zinc-400 max-w-md text-center">
          We are currently experiencing connection issues with our database.
          Please verify your internet connection or try again in a few moments.
        </p>
        <button
          className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-zinc-200 transition-colors"
          // In server components, simple generic retry via link or script is okay-ish to prompt refresh
          // But here acts as a pure render fallback.
        >
          <a href=".">Try Again</a>
        </button>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/sign-in');
  }

  const { workspaceSlug } = await params;

  let user;
  try {
    // Fetch user to get username
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
  } catch (error) {
    console.error('Failed to fetch user (DB Error):', error);
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#09090b] text-white">
        <h1 className="text-xl font-bold">Database Connection Error</h1>
        <p className="text-zinc-400">Could not retrieve user data.</p>
        <a
          href="."
          className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-zinc-200 transition-colors"
        >
          Try Again
        </a>
      </div>
    );
  }

  if (!user?.username) {
    return <div>Please set a username to view this workspace.</div>;
  }

  return (
    <WorkspaceOverviewPage
      username={user.username}
      workspaceSlug={workspaceSlug}
      token={session.session.token}
    />
  );
}
