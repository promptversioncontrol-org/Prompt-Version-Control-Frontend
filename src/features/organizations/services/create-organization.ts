import { prisma } from '@/shared/lib/prisma';
import type { CreateOrganizationInput } from '../types/organization.types';
import { generateSlug, ensureUniqueSlug } from '@/shared/utils/slug';
import { Resend } from 'resend';
import { InvitationEmailTemplate } from '@/shared/components/mail/invitation-email-template';
import crypto from 'crypto';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function createOrganization(orgData: CreateOrganizationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;
  const baseSlug = orgData.slug || generateSlug(orgData.name);

  // Check unique slug for organizations
  const existingOrgs = await prisma.organization.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });

  const existingSlugs = existingOrgs.map((o) => o.slug);
  const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: orgData.name,
        slug: uniqueSlug,
        description: orgData.description,
        image: orgData.image,
        website: orgData.website,
        industry: orgData.industry,
        members: {
          create: {
            userId: orgData.userId,
            role: 'owner',
          },
        },
      },
    });

    // 1. Create new workspaces
    if (orgData.workspacesToCreate && orgData.workspacesToCreate.length > 0) {
      for (const wsName of orgData.workspacesToCreate) {
        const wsSlug = generateSlug(`${org.slug}-${wsName}`);
        // Note: verify slug uniqueness logic if needed, but for now simple generation
        await tx.workspace.create({
          data: {
            name: wsName,
            slug: wsSlug,
            userId: orgData.userId,
            organizationId: org.id,
          },
        });
      }
    }
    // Fallback for backward compatibility/default behavior
    else if (orgData.createDefaultWorkspaces) {
      const defaultWorkspaces = ['Production', 'Staging', 'Development'];
      for (const wsName of defaultWorkspaces) {
        await tx.workspace.create({
          data: {
            name: wsName,
            slug: generateSlug(`${org.slug}-${wsName}`),
            userId: orgData.userId,
            organizationId: org.id,
          },
        });
      }
    }

    // 2. Link existing workspaces
    if (orgData.workspacesToLink && orgData.workspacesToLink.length > 0) {
      await tx.workspace.updateMany({
        where: {
          id: { in: orgData.workspacesToLink },
          userId: orgData.userId, // Security check: must own the workspace
        },
        data: {
          organizationId: org.id,
        },
      });
    }

    return org;
  });

  // 3. Handle Invitations
  const contributors = orgData.invitations || [];
  if (contributors.length > 0) {
    const inviter = await prisma.user.findUnique({
      where: { id: orgData.userId },
      select: { name: true, username: true },
    });
    const inviterName = inviter?.name || inviter?.username || 'Someone';

    for (const contributor of contributors) {
      if (!contributor.email) continue;

      try {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const existingUser = await prisma.user.findUnique({
          where: { email: contributor.email },
          select: { id: true },
        });

        // Add regular workspace invite logic if needed, but this is ORG invite
        await prisma.organizationInvitation.create({
          data: {
            token,
            email: contributor.email,
            role: contributor.role,
            organizationId: organization.id,
            inviterId: orgData.userId,
            inviteeId: existingUser?.id,
            expiresAt,
          },
        });

        const joinLink = `${process.env.NEXT_PUBLIC_APP_URL}/organizations/join?token=${token}`;

        if (resend) {
          await resend.emails.send({
            from: 'PVC <noreply@mail.adampukaluk.pl>',
            to: contributor.email,
            subject: `Invitation to join ${organization.name} on PVC`,
            react: InvitationEmailTemplate({
              inviterName,
              workspaceName: organization.name,
              joinLink,
            }) as React.ReactElement,
          });
        }
      } catch (e) {
        console.error(`Failed to invite ${contributor.email}`, e);
      }
    }
  }

  return organization;
}
