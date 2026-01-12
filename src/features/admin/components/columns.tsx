'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Ticket } from '../actions/get-tickets';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  MoreHorizontal,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { updateTicketStatus } from '../actions/update-ticket';
import { toast } from 'sonner';

// Funkcja pomocnicza do zmiany statusu
const handleStatusChange = async (id: string, status: string) => {
  const promise = updateTicketStatus(id, status);
  toast.promise(promise, {
    loading: 'Updating status...',
    success: 'Status updated!',
    error: 'Failed to update status',
  });
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-zinc-600">
        {row.getValue('id').slice(-4)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-zinc-800 hover:text-white px-0"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant="outline"
          className={
            status === 'OPEN'
              ? 'text-amber-400 border-amber-400/20 bg-amber-400/10'
              : status === 'IN_PROGRESS'
                ? 'text-blue-400 border-blue-400/20 bg-blue-400/10'
                : 'text-zinc-500 border-zinc-800 bg-zinc-900 line-through'
          }
        >
          {status === 'OPEN' && <AlertCircle className="w-3 h-3 mr-1" />}
          {status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Topic',
    cell: ({ row }) => {
      const cat = row.original.category;
      const sub = row.original.subCategory;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-200">{cat}</span>
          {sub && <span className="text-xs text-zinc-500">{sub}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'User',
    cell: ({ row }) => (
      <span className="text-zinc-400">{row.getValue('email')}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <div className="flex items-center text-zinc-500 text-xs">
        <Clock className="w-3 h-3 mr-1" />
        {formatDistanceToNow(new Date(row.getValue('createdAt')), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ticket = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-zinc-950 border-zinc-800 text-zinc-200"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(ticket.email)}
              className="cursor-pointer focus:bg-zinc-800 focus:text-white"
            >
              Copy User Email
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => handleStatusChange(ticket.id, 'IN_PROGRESS')}
              className="cursor-pointer text-blue-400 focus:bg-zinc-800 focus:text-blue-300"
            >
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(ticket.id, 'RESOLVED')}
              className="cursor-pointer text-emerald-400 focus:bg-zinc-800 focus:text-emerald-300"
            >
              Mark Resolved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(ticket.id, 'OPEN')}
              className="cursor-pointer text-amber-400 focus:bg-zinc-800 focus:text-amber-300"
            >
              Re-open Ticket
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
