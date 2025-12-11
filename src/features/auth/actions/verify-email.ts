'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyEmail(token: string) {
  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
    console.log('Verifying token:', token);
    // 1. Find verification record
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
      },
    });
    console.log('Verification record found:', verification ? 'Yes' : 'No');

    if (!verification) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // 2. Check expiration
    if (new Date() > verification.expiresAt) {
      return { success: false, error: 'Token verified has expired' };
    }

    // 3. Mark user as verified
    // Identifier in verification is userId
    await prisma.user.update({
      where: { id: verification.identifier },
      data: { emailVerified: true },
    });

    // 4. Delete verification record
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    return { success: true };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
