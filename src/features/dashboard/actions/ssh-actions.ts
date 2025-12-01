'use server';

import { z } from 'zod';
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
    return { error: result.error.errors[0].message };
  }

  try {
    // Simple fingerprint generation (mock for now, or use a library if available, but keeping it simple)
    // In a real app, we'd parse the key and generate a proper fingerprint.
    // For now, we'll just use a hash of the key or a random string if we can't easily generate it without extra libs.
    // Let's just use a simple base64 of the key part as a pseudo-fingerprint for uniqueness constraint if needed,
    // but the schema says fingerprint is unique.
    // Let's try to generate a pseudo-fingerprint.
    const fingerprint = Buffer.from(publicKey).toString('base64').slice(0, 32);

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
