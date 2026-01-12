'use server';

import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRoleSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1, 'Name is required'),
  workspaceIds: z.array(z.string()),
});

export async function createOrganizationRoleAction(
  organizationId: string,
  name: string,
  workspaceIds: string[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = createRoleSchema.safeParse({
    organizationId,
    name,
    workspaceIds,
  });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Invalid role data',
    };
  }

  try {
    // Check if user is owner/moderator of org? For now assume they can if they accessed the settings.
    // In a real app we'd verify 'session.user.id' is an owner/admin of 'organizationId'

    const role = await prisma.organizationRole.create({
      data: {
        organizationId,
        name,
        workspaceIds,
      },
    });

    revalidatePath(`/dashboard/organizations/[slug]/settings`);
    return { success: true, role };
  } catch (error) {
    console.error('Create role error:', error);
    return { success: false, error: 'Failed to create role' };
  }
}

export async function deleteOrganizationRoleAction(
  organizationId: string,
  roleId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.organizationRole.delete({
      where: { id: roleId, organizationId },
    });
    revalidatePath(`/dashboard/organizations/[slug]/settings`);
    return { success: true };
  } catch (error) {
    console.error('Delete role error:', error);
    return { success: false, error: 'Failed to delete role' };
  }
}

export async function getOrganizationRolesAction(organizationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const roles = await prisma.organizationRole.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    return {
      success: true,
      roles: roles.map((r) => ({
        ...r,
        membersCount: r._count.members,
      })),
    };
  } catch (error) {
    console.error('Get roles error:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }
}
