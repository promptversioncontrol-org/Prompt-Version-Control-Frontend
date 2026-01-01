import Link from 'next/link';
import { Card } from '@/shared/components/ui/card';
import { LifeBuoy, Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Overview
        </h2>
        <p className="text-zinc-400">Select a module to manage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/support" className="block group">
          <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-indigo-500 transition-all h-full">
            <div className="mb-4 w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              Support Tickets
            </h3>
            <p className="text-zinc-400">
              View and manage customer support requests, reply to users, and
              track issues.
            </p>
          </Card>
        </Link>

        {/* Placeholder for future modules */}
        <div className="block opacity-50 cursor-not-allowed">
          <Card className="p-6 bg-zinc-950 border-zinc-900 h-full">
            <div className="mb-4 w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-500 mb-2">
              Users Management
            </h3>
            <p className="text-zinc-600">
              Manage user accounts, roles, and permissions (Coming soon).
            </p>
          </Card>
        </div>

        <div className="block opacity-50 cursor-not-allowed">
          <Card className="p-6 bg-zinc-950 border-zinc-900 h-full">
            <div className="mb-4 w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-500 mb-2">
              System Settings
            </h3>
            <p className="text-zinc-600">
              Configure system preferences and global settings (Coming soon).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
