import { NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { inviteMember } from '@/features/organizations/services/invite-member';
import { z } from 'zod';

const inviteSchema = z.object({
  organizationId: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = inviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { organizationId, email, role } = result.data;

    await inviteMember(organizationId, email, role, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
