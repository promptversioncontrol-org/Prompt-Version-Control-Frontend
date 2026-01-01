'use client';

import { SupportTicket } from '@prisma/client';
import { Badge } from '@/shared/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/shared/components/ui/card';
import { MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TicketListProps {
  tickets: SupportTicket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-1">No tickets yet</h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Create your first ticket to get help from our engineering team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/dashboard/support/${ticket.id}`}
          className="group block"
        >
          <Card className="p-5 bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300 relative overflow-hidden">
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors truncate text-base">
                    {ticket.subject}
                  </h3>
                  {ticket.status === 'OPEN' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </div>

                <p className="text-sm text-zinc-500 truncate font-light">
                  {ticket.message}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    {ticket.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(ticket.createdAt))} ago
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={ticket.status} />
                {ticket.priority !== 'normal' && (
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      ticket.priority === 'urgent'
                        ? 'text-red-500'
                        : 'text-amber-500',
                    )}
                  >
                    {ticket.priority}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    CLOSED: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'uppercase text-[10px] py-0.5 h-6 px-2.5 tracking-wide',
        styles[status as keyof typeof styles] || styles.OPEN,
      )}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}
