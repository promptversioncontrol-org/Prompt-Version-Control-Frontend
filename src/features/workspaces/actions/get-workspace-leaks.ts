'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';

export interface GetWorkspaceLeaksParams {
  workspaceSlug: string;
  severity?: string;
  source?: string;
  search?: string;
  username?: string;
  limit?: number;
}

export async function getWorkspaceLeaks({
  workspaceSlug,
  severity,
  source,
  search,
  username,
  limit = 50,
}: GetWorkspaceLeaksParams & { username?: string }) {
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

  // 2. Build Query
  const where: Prisma.WorkspaceLeakWhereInput = {
    workspaceId: workspace.id,
  };

  if (severity && severity !== 'all') {
    where.severity = severity;
  }

  if (source && source !== 'all') {
    where.source = source;
  }

  if (search) {
    where.OR = [
      { message: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { snippet: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (username && username !== 'all') {
    where.username = username;
  }

  try {
    const leaks = await prisma.workspaceLeak.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: limit,
    });

    return { leaks };
  } catch (error) {
    console.error('Error fetching leaks:', error);
    return { leaks: [], error: 'Failed to fetch leaks' };
  }
}
