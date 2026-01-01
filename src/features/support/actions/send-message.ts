'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export async function sendMessage(
  ticketId: string,
  content: string,
  attachments: string[] = [],
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Verify access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const isAdmin =
      session.user.email === 'pukaluk.adam505@gmail.com' ||
      (session.user as { role?: string }).role === 'admin';

    if (ticket.userId !== session.user.id && !isAdmin) {
      throw new Error('Forbidden');
    }

    // Create message
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: session.user.id,
        content,
        attachments: attachments.length
          ? {
              create: attachments.map((url) => ({
                url,
                fileName: url.split('/').pop() || 'attachment',
                fileType: 'unknown',
              })),
            }
          : undefined,
      },
    });

    // If admin replies, update status to IN_PROGRESS if it was OPEN
    if (isAdmin && ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}
