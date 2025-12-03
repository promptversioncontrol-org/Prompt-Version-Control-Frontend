'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

export async function generateTelegramToken() {
  console.log('Starting generateTelegramToken...');

  // Log DB URL to ensure we're hitting the right DB (masked)
  const dbUrl = process.env.DATABASE_URL;
  console.log('DB URL available:', !!dbUrl);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    console.error('Unauthorized: No session user');
    throw new Error('Unauthorized');
  }

  console.log('User found:', session.user.id, session.user.email);

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  try {
    // Delete existing tokens for this user to keep it clean
    console.log('Deleting existing tokens for user:', session.user.id);
    const deleteResult = await prisma.telegramToken.deleteMany({
      where: { userId: session.user.id },
    });
    console.log('Deleted count:', deleteResult.count);

    console.log('Creating new token...');
    const result = await prisma.telegramToken.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt,
      },
    });
    console.log('Token created in DB:', result);

    // Verify it exists
    const verify = await prisma.telegramToken.findUnique({
      where: { token },
    });

    if (!verify) {
      console.error(
        'CRITICAL: Token was created but cannot be found immediately after!',
      );
      throw new Error('Token verification failed');
    }

    console.log('VERIFICATION READ: SUCCESS - Found in DB', verify);
  } catch (error) {
    console.error('Error saving token to DB:', error);
    throw error;
  }

  return token;
}
