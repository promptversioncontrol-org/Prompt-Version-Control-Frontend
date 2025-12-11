'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export async function getLeakUsers(workspaceSlug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 1. Verify access to workspace
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      OR: [
        { userId: session.user.id },
        { contributors: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  });

  if (!workspace) {
    throw new Error('Workspace not found or access denied');
  }

  // 2. Fetch distinct usernames
  const users = await prisma.workspaceLeak.findMany({
    where: {
      workspaceId: workspace.id,
      username: { not: null },
    },
    select: {
      username: true,
    },
    distinct: ['username'],
    orderBy: {
      username: 'asc',
    },
  });

  // Filter out nulls (though query does check not: null, distinct might return one null if not careful, but schema allows null)
  // map to string array
  return users
    .map((u) => u.username)
    .filter((u): u is string => u !== null && u !== '');
}
