'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { updateTicketStatus } from '@/features/admin/actions/update-ticket';
import { toast } from 'sonner';

export function AdminStatusSelector({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const handleStatusChange = async (status: string) => {
    const res = await updateTicketStatus(ticketId, status);
    if (res.success) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-400">Status:</span>
      <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
