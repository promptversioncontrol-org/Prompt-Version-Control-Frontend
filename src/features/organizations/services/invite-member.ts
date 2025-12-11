import { prisma } from '@/shared/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';
import { OrganizationInvitationEmailTemplate } from '@/shared/components/mail/organization-invitation-email-template';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function inviteMember(
  organizationId: string,
  email: string,
  role: string,
  inviterId: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) throw new Error('Organization not found');

  const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
  const inviterName = inviter?.name || 'Someone';

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Check if user is already a member
  if (existingUser) {
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this organization.');
    }
  }

  await prisma.organizationInvitation.create({
    data: {
      token,
      email,
      role,
      organizationId,
      inviterId,
      inviteeId: existingUser?.id,
      expiresAt,
    },
  });

  const joinLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organizations/join?token=${token}`;

  if (resend) {
    try {
      console.log(
        `[InviteMember] Sending email to ${email} with link: ${joinLink}`,
      );
      const result = await resend.emails.send({
        from: 'PVC <noreply@mail.adampukaluk.pl>',
        to: email,
        subject: `Invitation to join ${organization.name} on PVC`,
        react: OrganizationInvitationEmailTemplate({
          inviterName,
          organizationName: organization.name,
          joinLink,
        }) as React.ReactElement,
      });
      console.log(`[InviteMember] Email sent result:`, result);
    } catch (error) {
      console.error(`[InviteMember] Failed to send email:`, error);
    }
  } else {
    console.log(
      `[InviteMember] Resend not configured (Key present? ${!!process.env.RESEND_API_KEY}). Skipping email to ${email}. Link: ${joinLink}`,
    );
  }
}
