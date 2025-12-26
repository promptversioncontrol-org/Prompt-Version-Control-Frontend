import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { Resend } from 'resend';
import { SupportReceivedEmailTemplate } from '@/shared/components/mail/support-received-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, category, subCategory, message, userId, workspaceId } = body;

    // 1. Create Support Ticket in DB
    const ticket = await prisma.supportTicket.create({
      data: {
        email,
        category,
        subCategory,
        message,
        userId: userId || undefined,
        workspaceId: workspaceId || undefined,
      },
    });

    // 2. Send Confirmation Email
    if (email && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'PVC Support <noreply@mail.adampukaluk.pl>', // Update domain as needed
          to: [email],
          subject: `Support Request Received (Ticket #${ticket.id})`,
          react: SupportReceivedEmailTemplate({
            email,
            category: subCategory ? `${category} > ${subCategory}` : category,
            ticketId: ticket.id,
            messageSnippet:
              message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          }),
        });
      } catch (emailError) {
        console.error('Failed to send support email:', emailError);
        // Do not fail the request if email fails, just log it
      }
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error('Support Ticket Error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 },
    );
  }
}
