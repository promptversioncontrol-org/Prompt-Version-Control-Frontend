'use server';

import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { inviteMember } from '../services/invite-member';
import { revalidatePath } from 'next/cache';

export async function inviteMemberAction(
  organizationId: string,
  email: string,
  role: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await inviteMember(organizationId, email, role, session.user.id);
    revalidatePath(`/dashboard/organizations/[slug]`); // Revalidate dashboard
    return { success: true };
  } catch (error) {
    console.error('Invite error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invite member',
    };
  }
}
