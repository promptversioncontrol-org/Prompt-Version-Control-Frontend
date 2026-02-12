'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUser } from '@/shared/lib/session';

export async function getUserWorkspacesAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: user.id, // Only workspaces owned by the user
        organizationId: null, // Only workspaces not already in an org
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return { success: true, workspaces };
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    return { success: false, error: 'Failed to fetch workspaces' };
  }
}
