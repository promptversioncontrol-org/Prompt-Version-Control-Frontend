import { Suspense } from 'react';

import { TicketList } from '@/features/support/components/ticket-list';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { auth } from '@/shared/lib/auth'; // server auth
import { headers } from 'next/headers';
import { prisma } from '@/shared/lib/prisma'; // direct db access since this is a server component

async function getUserTickets() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return [];

  return prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function SupportPage() {
  const tickets = await getUserTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Support
          </h1>
          <p className="text-zinc-400">
            View your support tickets or create a new one.
          </p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link href="/dashboard/support/new">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={<div className="text-zinc-500">Loading tickets...</div>}
      >
        <TicketList tickets={tickets} />
      </Suspense>
    </div>
  );
}
