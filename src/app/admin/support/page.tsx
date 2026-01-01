import { getTickets } from '@/features/admin/actions/get-tickets';
import { DataTable } from '@/features/admin/components/data-table';
import { columns } from '@/features/admin/components/columns';
import { AdminStats } from '@/features/admin/components/admin-stats';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Customer Support Tickets
        </h2>
        <p className="text-zinc-400">
          Manage user inquiries and support requests.
        </p>
      </div>

      <AdminStats tickets={tickets} />
      <DataTable columns={columns} data={tickets} />
    </div>
  );
}
