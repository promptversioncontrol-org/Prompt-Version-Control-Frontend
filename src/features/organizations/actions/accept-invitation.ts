'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { membershipService } from '../services/membership-service';

export interface AcceptOrganizationInvitationResult {
  success: boolean;
  error?: string;
  organizationSlug?: string;
}

export async function acceptOrganizationInvitation(
  token: string,
): Promise<AcceptOrganizationInvitationResult> {
  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Find Invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: { organization: true },
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

    // 2. verify that the logged in user is the invitee (if inviteeId was set)
    // If inviteeId is null (public link?), we might allow it?
    // But logically inviteeId is set in inviteMember.
    if (invitation.inviteeId && invitation.inviteeId !== session.user.id) {
      // Check if the user email matches the invitation email
      if (session.user.email !== invitation.email) {
        return {
          success: false,
          error: 'This invitation belongs to another user',
        };
      }
      // If email matches but ID doesn't... maybe user re-created account?
      // Let's assume strict check if inviteeId exists.
      return {
        success: false,
        error: 'This invitation belongs to another user',
      };
    }

    // If inviteeId was NOT set (e.g. invited by email before user registered), we should check email match.
    if (!invitation.inviteeId) {
      if (session.user.email !== invitation.email) {
        return {
          success: false,
          error: 'This invitation was sent to a different email address',
        };
      }
    }

    // 3. Create Member
    // Check if member already exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      // Already a member, just update status to accepted if not already?
      // Or just return success.
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });
      return { success: true, organizationSlug: invitation.organization.slug };
    }

    await membershipService.addMemberToOrganization(
      invitation.organizationId,
      session.user.id,
      invitation.role,
    );

    // 4. Update Invitation Status
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        inviteeId: session.user.id, // Ensure inviteeId is set if it wasn't
      },
    });

    return { success: true, organizationSlug: invitation.organization.slug };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}
