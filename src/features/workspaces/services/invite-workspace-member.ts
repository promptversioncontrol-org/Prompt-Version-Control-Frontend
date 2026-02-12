import { prisma } from '@/shared/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';
import { InvitationEmailTemplate } from '@/shared/components/mail/invitation-email-template';

export async function inviteWorkspaceMember(
  workspaceId: string,
  email: string,
  role: string,
  inviterId: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found. Please ask them to sign up first.');
    }

    const existingMember = await prisma.workspaceContributor.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this workspace.');
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    if (!workspace) throw new Error('Workspace not found');

    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { name: true, username: true },
    });
    const inviterName = inviter?.name || inviter?.username || 'Someone';

    await prisma.workspaceInvitation.create({
      data: {
        token,
        workspaceId,
        inviteeId: user.id,
        inviterId,
        role,
        status: 'PENDING',
        expiresAt,
      },
    });

    const joinLink = `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/join?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: 'PVC <noreply@mail.adampukaluk.pl>',
        to: email,
        subject: `Invitation to join ${workspace.name} on PVC`,
        react: InvitationEmailTemplate({
          inviterName,
          workspaceName: workspace.name || 'Workspace',
          joinLink,
        }) as React.ReactElement,
      });
    } else {
      console.log(
        `Resend not configured. Skipping email to ${email}. Link: ${joinLink}`,
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error inviting member:', error);
    throw error;
  }
}
