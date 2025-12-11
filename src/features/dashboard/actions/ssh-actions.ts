'use server';

import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

const addSshKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  publicKey: z
    .string()
    .min(1, 'Public key is required')
    .startsWith('ssh-', 'Invalid SSH key format'),
});

export async function addSshKey(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const publicKey = formData.get('publicKey') as string;

  const result = addSshKeySchema.safeParse({ name, publicKey });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    // Generate proper SHA256 fingerprint to match verification logic
    const clean = result.data.publicKey.split(' ').slice(0, 2).join(' ');
    const fingerprint = createHash('sha256').update(clean).digest('base64');

    await prisma.sshKey.create({
      data: {
        name: result.data.name,
        publicKey: result.data.publicKey,
        fingerprint: fingerprint, // unique constraint
        userId: session.user.id,
      },
    });

    revalidatePath('/dashboard/ssh');
    return { success: true };
  } catch (error) {
    console.error('Failed to add SSH key:', error);
    return { error: 'Failed to add SSH key. It might already exist.' };
  }
}

export async function deleteSshKey(keyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.sshKey.delete({
      where: {
        id: keyId,
        userId: session.user.id, // Ensure ownership
      },
    });

    revalidatePath('/dashboard/ssh');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete SSH key:', error);
    return { error: 'Failed to delete SSH key' };
  }
}
