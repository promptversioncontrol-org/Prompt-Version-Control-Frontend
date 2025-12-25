import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { VerificationLinkTemplate } from '@/shared/components/mail/verification-link-template';
import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import cryptoUB from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    // 1. Validate Authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 400 },
      );
    }

    const token = cryptoUB.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verification.deleteMany({
      where: { identifier: user.id },
    });

    await prisma.verification.create({
      data: {
        id: cryptoUB.randomUUID(),
        identifier: user.id,
        value: token,
        expiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const verificationLink = `${baseUrl}/account-verification?token=${token}`;

    const { error } = await resend.emails.send({
      from: 'PVC <noreply@mail.adampukaluk.pl>',
      to: [user.email],
      subject: 'Verify your email address',
      react: (
        <VerificationLinkTemplate
          userName={user.name}
          verificationLink={verificationLink}
        />
      ),
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (err) {
    console.error('SERVER ERROR:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
