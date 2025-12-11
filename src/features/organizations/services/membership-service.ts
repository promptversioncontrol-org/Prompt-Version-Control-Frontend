import { prisma } from '@/shared/lib/prisma';
import { OrganizationMember, OrganizationRole } from '@prisma/client';

export const DEFAULT_ROLES = ['owner', 'moderator', 'member'] as const;
export type DefaultRole = (typeof DEFAULT_ROLES)[number];

export class MembershipService {
  /**
   * Adds a user to an organization with a specific role.
   * Handles both default roles (owner, moderator, member) and custom roles.
   */
  async addMemberToOrganization(
    organizationId: string,
    userId: string,
    roleName: string,
  ): Promise<OrganizationMember> {
    const { role, organizationRoleId } = await this.resolveRole(
      organizationId,
      roleName,
    );

    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
        organizationRoleId,
      },
    });
  }

  /**
   * Updates an existing member's role.
   * Handles switching between default keys and custom roles.
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    roleName: string,
  ): Promise<OrganizationMember> {
    const { role, organizationRoleId } = await this.resolveRole(
      organizationId,
      roleName,
    );

    return prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: {
        role,
        organizationRoleId,
      },
    });
  }

  /**
   * Helper to resolve the role string to the correct DB fields.
   * If roleName is a default role, organizationRoleId is null.
   * If roleName is a custom role, we assume roleName corresponds to OrganizationRole.name
   * and we set organizationRoleId.
   *
   * Fallback: If custom role not found, defaults to 'member'.
   */
  private async resolveRole(organizationId: string, roleName: string) {
    // 1. Check if it is a default role
    if (DEFAULT_ROLES.includes(roleName as DefaultRole)) {
      return {
        role: roleName,
        organizationRoleId: null,
      };
    }

    // 2. Try to find a custom role by name
    const customRole = await prisma.organizationRole.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: roleName,
        },
      },
    });

    if (customRole) {
      // In logical flow, the 'role' field in OrganizationMember might still be 'member'
      // or we might want to store the custom name there too for easier display if we relax the enum?
      // Since `role` is a String in schema (not Enum), we can store the custom name there!
      // This makes frontend display easier.
      return {
        role: customRole.name,
        organizationRoleId: customRole.id,
      };
    }

    // 3. Fallback
    console.warn(
      `Role ${roleName} not found for org ${organizationId}. Defaulting to 'member'.`,
    );
    return {
      role: 'member',
      organizationRoleId: null,
    };
  }
}

export const membershipService = new MembershipService();
