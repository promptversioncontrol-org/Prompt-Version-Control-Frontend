'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUser } from '@/shared/lib/session';
import { revalidatePath } from 'next/cache';

export async function toggleWorkspaceAccessAction(
  organizationId: string,
  workspaceId: string,
  targetUserId: string,
  hasAccess: boolean,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Verify currentUser is Owner/Moderator of the Organization
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

    // 2. Verify Workspace belongs to Organization
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    if (workspace?.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Workspace does not belong to this organization',
      };
    }

    if (hasAccess) {
      // Grant Access: Create WorkspaceContributor
      // Check if already exists
      const exists = await prisma.workspaceContributor.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      });

      if (!exists) {
        await prisma.workspaceContributor.create({
          data: {
            workspaceId,
            userId: targetUserId,
            role: 'member', // Default role for specific workspace access
          },
        });
      }
    } else {
      // Revoke Access: Delete WorkspaceContributor
      await prisma.workspaceContributor.deleteMany({
        where: {
          workspaceId,
          userId: targetUserId,
        },
      });
    }

    revalidatePath(`/dashboard/organizations`); // broad revalidate or specific
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle workspace access:', error);
    return { success: false, error: 'Failed to update access' };
  }
}

export async function getOrganizationMembersWithAccess(organizationId: string) {
  // Fetch members and their workspace contributions
  try {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contributions: {
              where: {
                workspace: {
                  organizationId,
                },
              },
              select: {
                workspaceId: true,
              },
            },
          },
        },
      },
    });

    const workspaces = await prisma.workspace.findMany({
      where: { organizationId },
      select: { id: true, name: true, slug: true },
    });

    return { success: true, members, workspaces };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed' };
  }
}
