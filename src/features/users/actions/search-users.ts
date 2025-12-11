'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

import type { SearchUserResult } from '../contracts/user.dto';

export async function searchUsers(query: string): Promise<SearchUserResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            id: { not: session.user.id }, // Exclude current user
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
      },
      take: 10,
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
