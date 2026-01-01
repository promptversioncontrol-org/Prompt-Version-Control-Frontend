import { getTicket } from '@/features/support/actions/get-ticket';
import { TicketChat } from '@/features/support/components/ticket-chat';
import { notFound } from 'next/navigation';
import { Badge } from '@/shared/components/ui/badge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {ticket.subject}
            </h1>
            <Badge variant="outline" className="uppercase text-xs">
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm">
            Drafted as <span className="text-white">{ticket.category}</span>{' '}
            issue
          </p>
        </div>
      </div>

      <TicketChat
        ticketId={ticket.id}
        initialMessages={ticket.messages}
        status={ticket.status}
      />
    </div>
  );
}
