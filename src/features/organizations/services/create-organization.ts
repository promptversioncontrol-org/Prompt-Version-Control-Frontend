import { prisma } from '@/shared/lib/prisma';
import type { CreateOrganizationInput } from '../types/organization.types';
import { generateSlug, ensureUniqueSlug } from '@/shared/utils/slug';
import { Resend } from 'resend';
import crypto from 'crypto';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function createOrganization(orgData: CreateOrganizationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;
  const baseSlug = generateSlug(orgData.name);

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

    if (orgData.createDefaultWorkspaces) {
      const defaultWorkspaces = ['Production', 'Staging', 'Development'];
      for (const wsName of defaultWorkspaces) {
        const wsSlug = ensureUniqueSlug(generateSlug(wsName), []);
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

    return org;
  });

  if (orgData.contributors && orgData.contributors.length > 0) {
    const inviter = await prisma.user.findUnique({
      where: { id: orgData.userId },
      select: { name: true, username: true },
    });
    const inviterName = inviter?.name || inviter?.username || 'Someone';

    for (const contributor of orgData.contributors) {
      if (!contributor.email) continue;

      try {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const existingUser = await prisma.user.findUnique({
          where: { email: contributor.email },
          select: { id: true },
        });

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
            html: `<p>${inviterName} invited you to join <strong>${organization.name}</strong>.</p><p><a href="${joinLink}">Click here to join</a></p>`,
          });
        } else {
          console.log(
            `Resend not configured. Skipping email to ${contributor.email}.`,
          );
        }
      } catch (e) {
        console.error(`Failed to invite ${contributor.email}`, e);
      }
    }
  }

  return organization;
}
