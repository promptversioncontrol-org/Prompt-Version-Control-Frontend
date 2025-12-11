'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export interface LeaderboardEntry {
  username: string;
  count: number;
}

export async function getLeakLeaderboard(
  workspaceSlug: string,
): Promise<LeaderboardEntry[]> {
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

  // 2. Aggregate leaks by username
  const groupedLeaks = await prisma.workspaceLeak.groupBy({
    by: ['username'],
    where: {
      workspaceId: workspace.id,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        username: 'desc',
      },
    },
    take: 10,
  });

  // 3. Format result
  return groupedLeaks
    .map((entry) => ({
      username: entry.username || 'Unknown User',
      count: entry._count._all,
    }))
    .sort((a, b) => b.count - a.count); // Ensure sorted by count desc
}
