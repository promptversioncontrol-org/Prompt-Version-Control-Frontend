'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Types (simplified for UI demo)
interface OrganizationDashboardProps {
  organization: {
    name: string;
    description?: string | null;
    slug: string;
    createdAt: Date | string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaces: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roles: any[];
  currentUserId: string;
  initialTab?: string;
}

export function OrganizationDashboard({
  organization,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  workspaces,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  members,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentUserId,
  initialTab = 'workspaces',
}: OrganizationDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync tab state with URL
  const currentTab = searchParams.get('tab') || initialTab;

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?tab=${value}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner / Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link
              href="/dashboard/organizations"
              className="hover:text-white transition-colors"
            >
              Organizations
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{organization.name}</span>
          </div>
          {/* Quick Actions if needed */}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Org Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {organization.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white">
                {organization.name}
              </h1>
              <p className="text-zinc-400 max-w-lg">
                {organization.description ||
                  'Manage your organization resources here.'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="bg-zinc-900 text-zinc-400 text-xs px-2 py-1 rounded border border-zinc-800 font-mono">
                  {organization.slug}
                </span>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-zinc-500 text-xs">
                  Created{' '}
                  {new Date(organization.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl h-auto inline-flex">
            <TabsTrigger
              value="workspaces"
              className="rounded-lg px-6 py-2.5 text-sm font-medium data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-white transition-all"
            >
              Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-lg px-6 py-2.5 text-sm font-medium data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-white transition-all"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg px-6 py-2.5 text-sm font-medium data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-white transition-all"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="relative min-h-[400px]">
            <TabsContent
              value="workspaces"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none"
            >
              {/* Assuming you have a component for this list */}
              {/* Pass props: workspaces={workspaces} */}
              <div className="p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-center">
                <p className="text-zinc-500">
                  Workspace list component goes here...
                </p>
              </div>
            </TabsContent>

            <TabsContent
              value="members"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none"
            >
              <div className="p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-center">
                <p className="text-zinc-500">
                  Members list component goes here...
                </p>
              </div>
            </TabsContent>

            <TabsContent
              value="settings"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none"
            >
              <div className="max-w-2xl">
                <div className="p-8 border border-zinc-800 rounded-2xl bg-zinc-900/30">
                  <h3 className="text-lg font-medium text-white mb-4">
                    General Settings
                  </h3>
                  {/* Settings Form */}
                  <p className="text-zinc-500">
                    Settings form component goes here...
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
