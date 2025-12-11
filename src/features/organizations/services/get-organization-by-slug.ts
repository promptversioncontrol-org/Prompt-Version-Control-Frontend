import { prisma } from '@/shared/lib/prisma';

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { workspaces: true, members: true },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
