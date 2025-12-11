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
      createdAt: true,
      userId: true,
      securityRules: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          email: true,
        },
      },
      _count: {
        select: {
          leaks: true,
        },
      },
      contributors: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
