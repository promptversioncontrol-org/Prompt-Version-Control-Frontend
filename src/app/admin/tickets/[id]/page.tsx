import { getTicket } from '@/features/support/actions/get-ticket';
import { TicketChat } from '@/features/support/components/ticket-chat';
import { notFound } from 'next/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { AdminStatusSelector } from '@/features/admin/components/admin-status-selector';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        asChild
        variant="ghost"
        className="w-fit p-0 hover:bg-transparent hover:text-white text-zinc-400"
      >
        <Link href="/admin">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Link>
      </Button>

      <div className="flex items-start justify-between bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {ticket.subject}
            </h1>
            <Badge variant="outline" className="uppercase text-xs">
              {ticket.priority}
            </Badge>
          </div>

          <div className="text-zinc-400 text-sm space-y-1">
            <p>
              User: <span className="text-white">{ticket.email}</span>
            </p>
            <p>
              Category: <span className="text-white">{ticket.category}</span>
            </p>
          </div>
        </div>

        <AdminStatusSelector
          ticketId={ticket.id}
          currentStatus={ticket.status}
        />
      </div>

      <TicketChat
        ticketId={ticket.id}
        initialMessages={ticket.messages}
        status={ticket.status}
      />
    </div>
  );
}
