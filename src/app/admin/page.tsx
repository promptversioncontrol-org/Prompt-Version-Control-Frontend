import { getTickets } from '@/features/admin/actions/get-tickets';
import { DataTable } from '@/features/admin/components/data-table';
import { columns } from '@/features/admin/components/columns';
import { AdminStats } from '@/features/admin/components/admin-stats';

// Wymusza dynamiczne renderowanie, żeby widzieć nowe tickety
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Support Overview
        </h2>
        <p className="text-zinc-400">
          Manage incoming support requests and track team performance.
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStats tickets={tickets} />

      {/* Data Table */}
      <DataTable columns={columns} data={tickets} />
    </div>
  );
}
