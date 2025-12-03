'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export async function getConnectedTelegram() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userTelegram = await prisma.userTelegram.findUnique({
    where: { userId: session.user.id },
  });

  return userTelegram;
}
