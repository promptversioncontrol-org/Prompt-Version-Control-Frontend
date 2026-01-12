'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth'; // Importing server-side auth helper if available, or just using headers
import { headers } from 'next/headers';

export type Ticket = {
  id: string;
  email: string;
  category: string;
  subCategory: string | null;
  message: string;
  status: string;
  createdAt: Date;
};

export async function getTickets(): Promise<Ticket[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin (email-based or role-based)
    const isAdmin =
      session.user.email === 'pukaluk.adam505@gmail.com' ||
      (session.user as { role?: string }).role === 'admin';

    if (!isAdmin) {
      throw new Error('Forbidden');
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return [];
  }
}
