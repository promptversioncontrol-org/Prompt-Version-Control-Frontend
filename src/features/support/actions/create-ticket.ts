'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  attachments: z.array(z.string()).optional(), // Array of attachment URLs
});

export async function createTicket(data: z.infer<typeof createTicketSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const { subject, category, message, priority, attachments } =
      createTicketSchema.parse(data);

    // Create ticket and initial message
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        subject,
        category,
        message, // Main issue description
        priority,
        status: 'OPEN',
        messages: {
          create: {
            content: message,
            userId: session.user.id,
            attachments: attachments?.length
              ? {
                  create: attachments.map((url) => ({
                    url,
                    fileName: url.split('/').pop() || 'attachment', // Simple fallback for name
                    fileType: 'unknown', // Ideally passed from frontend
                  })),
                }
              : undefined,
          },
        },
      },
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
}
