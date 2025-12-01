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

  // We need the username to reuse the existing component
  // The session user object might not have the username if it's not in the session payload
  // But looking at auth.ts, it seems standard.
  // If username is missing in session, we might need to fetch it,
  // but let's assume it's available or we can fetch the user.

  // Actually, UserWorkspacesPage fetches the user by username.
  // We should probably refactor UserWorkspacesPage to accept a user object or ID,
  // but to minimize changes, we'll pass the username if available.

  // If username is not in session, we should fetch it.
  // Let's assume for now we can get it. If not, we'll fix it.
  // Prisma adapter usually returns the user object.

  // Wait, the session.user type from better-auth might be limited.
  // Let's try to use the username from session if it exists, otherwise we might need to fetch.
  // For now, let's assume we can get it.

  // Actually, let's fetch the user to be safe and get the username.
  // We can use the existing service if we have the username, but we have the ID.

  // Let's just try to pass session.user.username if it exists (it might be typed as any or have it).
  // If not, we will see an error.

  // To be safe, I will import prisma and fetch the user by ID to get the username.
  const { prisma } = await import('@/shared/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!user?.username) {
    // Handle case where user has no username (shouldn't happen for active users usually)
    return <div>Please set a username to view workspaces.</div>;
  }

  return <UserWorkspacesPage username={user.username} />;
}
