import { prisma } from '@/shared/lib/prisma';

export async function getOrganizationWorkspaces(organizationId: string) {
  return prisma.workspace.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, image: true } }, // Owner/Creator info
    },
  });
}
