'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Ticket } from '../actions/get-tickets';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null,
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {/* --- Toolbar --- */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Filter emails..."
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
            className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-zinc-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-zinc-800 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-zinc-400 font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(row.original as Ticket)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-zinc-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* --- Detail Dialog (Centered Modal) --- */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[600px] text-white p-0 overflow-hidden gap-0">
          <div className="p-6 pb-4 border-b border-zinc-900">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              Ticket details
              <span className="text-xs font-mono font-normal text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                {selectedTicket?.id.slice(-8)}
              </span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-1">
              Review detailed information about this request.
            </DialogDescription>
          </div>

          {selectedTicket && (
            <ScrollArea className="max-h-[80vh]">
              <div className="p-6 space-y-8">
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Status
                    </span>
                    <div className="font-medium text-sm">
                      {selectedTicket.status}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Date
                    </span>
                    <div className="font-medium text-sm">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* User - Full width on mobile/small columns to avoid overlap */}
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      User
                    </span>
                    <div className="font-medium text-sm text-indigo-400 break-all">
                      {selectedTicket.email}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Category
                    </span>
                    <div className="font-medium text-sm">
                      {selectedTicket.category} /{' '}
                      {selectedTicket.subCategory || '-'}
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-900" />

                {/* Message Body */}
                <div className="space-y-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Message Content
                  </span>
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* AI Analysis Mockup */}
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    AI Insights
                  </div>
                  <p className="text-xs text-zinc-400">
                    This is a placeholder for future AI analysis of the ticket
                    content.
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
