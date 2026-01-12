'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Proste sprawdzenie admina (w produkcji przenieś to do middleware/utils)
    const isAdmin =
      session?.user?.email === 'pukaluk.adam505@gmail.com' ||
      (session?.user as { role?: string }).role === 'admin';
    if (!isAdmin) throw new Error('Unauthorized');

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update ticket' };
  }
}
