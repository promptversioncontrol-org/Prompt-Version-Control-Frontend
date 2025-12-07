import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/ui/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, phone, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <contact@mail.adampukaluk.pl>',
      to: ['pukalukadam505@gmail.com'],
      subject: `📩 New message from ${firstName} ${lastName}`,
      react: EmailTemplate({
        firstName,
        lastName,
        email,
        phone,
        message,
      }),
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('SERVER ERROR:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
