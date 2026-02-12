'use server';

import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { inviteWorkspaceMember } from '../services/invite-workspace-member';
import { revalidatePath } from 'next/cache';

export async function inviteWorkspaceMemberAction(
  workspaceId: string,
  email: string,
  role: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await inviteWorkspaceMember(workspaceId, email, role, session.user.id);
    revalidatePath('/dashboard/workspaces/[workspaceSlug]/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite member',
    };
  }
}
