import { prisma } from '@/shared/lib/prisma';

export async function getUserWithWorkspaces(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      workspacesOwned: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
