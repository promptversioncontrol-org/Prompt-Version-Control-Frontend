'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export interface AcceptInvitationResult {
  success: boolean;
  error?: string;
  workspaceSlug?: string;
}

export async function acceptInvitation(
  token: string,
): Promise<AcceptInvitationResult> {
  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      // Alternatively, we could allow accepting without session if we auto-login or redirect to login.
      // But for security, let's require login. The Page will handle redirect if not logged in.
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Find Invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return { success: false, error: 'Invalid invitation' };
    }

    if (invitation.status !== 'PENDING') {
      return {
        success: false,
        error: 'Invitation already accepted or rejected',
      };
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: 'Invitation expired' };
    }

    // 2. verify that the logged in user is the invitee
    // Security check: ensure the user accepting is the one invited.
    if (invitation.inviteeId !== session.user.id) {
      return {
        success: false,
        error: 'This invitation belongs to another user',
      };
    }

    // 3. Create Contributor
    await prisma.workspaceContributor.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: invitation.role,
      },
    });

    // 4. Update Invitation Status
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    return { success: true, workspaceSlug: invitation.workspace.slug };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}
