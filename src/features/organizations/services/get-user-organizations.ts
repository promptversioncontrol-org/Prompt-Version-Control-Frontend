import { prisma } from '@/shared/lib/prisma';

export async function getUserOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      _count: {
        select: { workspaces: true, members: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
