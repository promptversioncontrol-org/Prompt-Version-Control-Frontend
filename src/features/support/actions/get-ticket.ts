'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export async function getTicket(ticketId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                email: true,
              },
            },
            attachments: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return null;
    }

    // Authorization check: User can access if they own it OR are admin
    const isAdmin =
      session.user.email === 'pukaluk.adam505@gmail.com' ||
      (session.user as { role?: string }).role === 'admin';

    if (ticket.userId !== session.user.id && !isAdmin) {
      throw new Error('Forbidden');
    }

    return ticket;
  } catch (error) {
    console.error('Failed to get ticket:', error);
    return null;
  }
}
