'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUser } from '@/shared/lib/session';
import { revalidatePath } from 'next/cache';

import { membershipService } from '../services/membership-service';

export async function updateOrganizationRoleAction(
  organizationId: string,
  targetUserId: string,
  newRole: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Check if current user is Owner or Moderator
    const currentMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: currentUser.id,
        },
      },
    });

    if (
      !currentMember ||
      (currentMember.role !== 'owner' && currentMember.role !== 'moderator')
    ) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Owner check: Moderators cannot change Owner's role or promote to Owner
    if (currentMember.role === 'moderator') {
      if (newRole === 'owner')
        return { success: false, error: 'Moderators cannot promote to Owner' };
      const targetMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId, userId: targetUserId },
        },
      });
      if (targetMember?.role === 'owner')
        return { success: false, error: 'Moderators cannot modify Owners' };
    }

    // 2. Update Role using centralized service
    await membershipService.updateMemberRole(
      organizationId,
      targetUserId,
      newRole,
    );

    revalidatePath(`/dashboard/organizations`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

export async function removeOrganizationMemberAction(
  organizationId: string,
  targetUserId: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, error: 'Unauthorized' };

  try {
    const currentMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: currentUser.id },
      },
    });

    if (!currentMember || currentMember.role !== 'owner') {
      // Allow self-leave?
      if (currentUser.id !== targetUserId) {
        return { success: false, error: 'Insufficient permissions' };
      }
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    // Also remove from all workspace invites/contributions in this org?
    // Clean up workspace access
    const orgWorkspaces = await prisma.workspace.findMany({
      where: { organizationId },
      select: { id: true },
    });

    const workspaceIds = orgWorkspaces.map((w) => w.id);

    if (workspaceIds.length > 0) {
      await prisma.workspaceContributor.deleteMany({
        where: {
          userId: targetUserId,
          workspaceId: { in: workspaceIds },
        },
      });
    }

    revalidatePath(`/dashboard/organizations`);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove member:', error);
    return { success: false, error: 'Failed to remove member' };
  }
}
