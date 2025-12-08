import { prisma } from '@/shared/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

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

  const joinLink = `${process.env.NEXT_PUBLIC_APP_URL}/organizations/join?token=${token}`;

  if (resend) {
    await resend.emails.send({
      from: 'PVC <noreply@mail.adampukaluk.pl>',
      to: email,
      subject: `Invitation to join ${organization.name} on PVC`,
      html: `<p>${inviterName} invited you to join <strong>${organization.name}</strong> as <strong>${role}</strong>.</p><p><a href="${joinLink}">Click here to join</a></p>`,
    });
  } else {
    console.log(`Resend not configured. Skipping email to ${email}.`);
  }
}
