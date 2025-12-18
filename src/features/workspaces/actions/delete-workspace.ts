'use server';

import { prisma } from '@/shared/lib/prisma';
import { redirect } from 'next/navigation';

export async function deleteWorkspace(workspaceId: string) {
  try {
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw new Error('Failed to delete workspace');
  }

  redirect('/dashboard/workspaces');
}
