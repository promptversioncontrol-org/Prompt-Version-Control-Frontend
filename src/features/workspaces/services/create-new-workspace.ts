// I realized I need to check the type definition first.

import type {
  CreateWorkspaceInput,
  CreateWorkspaceResponse,
} from '../types/workspace.types';
import { generateSlug, ensureUniqueSlug } from '@/shared/utils/slug';
import { prisma } from '@/shared/lib/prisma';
import { Resend } from 'resend';
import { InvitationEmailTemplate } from '@/shared/components/mail/invitation-email-template';
import crypto from 'crypto';

export async function createNewWorkspace(
  workspaceData: CreateWorkspaceInput,
): Promise<CreateWorkspaceResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  if (!apiKey) {
    console.warn(
      'RESEND_API_KEY is missing. Email invitations will be skipped.',
    );
  }

  try {
    const baseSlug = generateSlug(workspaceData.name);

    const existingWorkspaces = await prisma.workspace.findMany({
      where: { userId: workspaceData.userId },
      select: { slug: true },
    });

    const existingSlugs = existingWorkspaces.map((w) => w.slug);
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceData.name,
        slug: uniqueSlug,
        description: workspaceData.description,
        userId: workspaceData.userId,
        image: workspaceData.image,
      },
    });

    if (workspaceData.contributors && workspaceData.contributors.length > 0) {
      const inviter = await prisma.user.findUnique({
        where: { id: workspaceData.userId },
        select: { name: true, username: true },
      });

      const inviterName = inviter?.name || inviter?.username || 'Someone';

      for (const contributor of workspaceData.contributors) {
        if (!contributor.username.trim()) continue;

        try {
          const userToInvite = await prisma.user.findUnique({
            where: { username: contributor.username },
            select: { id: true, email: true },
          });

          if (userToInvite && userToInvite.email) {
            const token = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await prisma.workspaceInvitation.create({
              data: {
                token,
                workspaceId: workspace.id,
                inviteeId: userToInvite.id,
                inviterId: workspaceData.userId,
                role: contributor.role,
                status: 'PENDING',
                expiresAt,
              },
            });

            const joinLink = `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/join?token=${token}`;

            if (resend) {
              const { error: sendError } = await resend.emails.send({
                from: 'PVC <noreply@mail.adampukaluk.pl>',
                to: userToInvite.email,
                subject: `Invitation to join ${workspace.name}`,
                react: InvitationEmailTemplate({
                  inviterName,
                  workspaceName: workspace.name || 'Workspace',
                  joinLink,
                }) as React.ReactElement,
              });

              if (sendError) {
                console.error(
                  `Failed to send email to ${userToInvite.email}:`,
                  sendError,
                );
              } else {
                console.log(`Invitation sent to ${userToInvite.email}`);
              }
            } else {
              console.log(
                `Resend not configured. Skipping email to ${userToInvite.email}. Link: ${joinLink}`,
              );
            }
          } else {
            console.warn(
              `User not found or no email for: ${contributor.username}`,
            );
          }
        } catch (inviteError) {
          console.error(
            `Failed to invite ${contributor.username}:`,
            inviteError,
          );
        }
      }
    }

    return workspace;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
}
