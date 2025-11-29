import { prisma } from '@/shared/lib/prisma';

export async function getWorkspaceBySlug(
  username: string,
  workspaceSlug: string,
) {
  return prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      user: {
        username,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      visibility: true,
      createdAt: true,
      userId: true,
    },
  });
}
