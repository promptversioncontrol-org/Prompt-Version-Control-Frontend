'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Ticket } from '@/features/admin/actions/get-tickets';
import { formatDistanceToNow } from 'date-fns';

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
            <TableHead className="text-zinc-400">ID</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Category</TableHead>
            <TableHead className="text-zinc-400">Message</TableHead>
            <TableHead className="text-zinc-400">User</TableHead>
            <TableHead className="text-zinc-400">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="border-zinc-800 data-[state=selected]:bg-zinc-900"
              >
                <TableCell className="font-mono text-xs text-zinc-500">
                  {ticket.id.slice(-8)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      ticket.status === 'OPEN'
                        ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10'
                        : 'text-green-500 border-green-500/20 bg-green-500/10'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-300">
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.category}</span>
                    {ticket.subCategory && (
                      <span className="text-xs text-zinc-500">
                        {ticket.subCategory}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate text-zinc-400">{ticket.message}</p>
                </TableCell>
                <TableCell className="text-zinc-300">{ticket.email}</TableCell>
                <TableCell className="text-zinc-500 whitespace-nowrap">
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
