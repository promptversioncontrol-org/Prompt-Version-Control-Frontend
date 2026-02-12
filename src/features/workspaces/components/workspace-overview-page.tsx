import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkspaceBySlug } from '../services/get-workspace-by-slug';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Settings, Calendar, Activity, ShieldCheck, Users } from 'lucide-react';
import { LiveStreamFeed } from './live-stream-feed';
import { LeakHistory } from './leak-history';
import { LeakLeaderboard } from './leak-leaderboard';
import { WorkspaceUsersList } from './workspace-users-list';
import { WorkspaceBreadcrumb } from './workspace-breadcrumb';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';

interface WorkspaceOverviewPageProps {
  username: string;
  workspaceSlug: string;
  token?: string;
}

export default async function WorkspaceOverviewPage({
  username,
  workspaceSlug,
  token,
}: WorkspaceOverviewPageProps) {
  const workspace = await getWorkspaceBySlug(username, workspaceSlug);

  if (!workspace) {
    notFound();
  }

  return (
    <div className="min-h-screen relative bg-[#09090b]">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-6 relative z-10 space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
          <div className="space-y-3">
            <WorkspaceBreadcrumb workspaceSlug={workspace.slug} />
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {workspace.name}
              </h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              {workspace.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/dashboard/workspaces/${workspace.slug}/settings`}>
              <Button
                variant="secondary"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600 shadow-sm transition-all"
              >
                <Settings className="mr-2 h-4 w-4" />
                Workspace Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* METRICS / QUICK STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 flex flex-col justify-between">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity size={14} /> Total Incidents
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {workspace._count.leaks}
            </div>
          </Card>
          <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 flex flex-col justify-between">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck size={14} /> Security Score
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              98%
            </div>
          </Card>
          <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 flex flex-col justify-between">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar size={14} /> Created
            </div>
            <div className="text-lg font-mono text-zinc-300">
              {new Date(workspace.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </Card>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: LIVE FEED (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="live"
                  className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-zinc-100"
                >
                  <Activity className="h-4 w-4 mr-2" /> Live Stream
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-zinc-100"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Leak History
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-zinc-100"
                >
                  <Users className="h-4 w-4 mr-2" /> Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Live Activity
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 animate-pulse"
                  >
                    ● Real-time
                  </Badge>
                </div>
                <LiveStreamFeed
                  workspaceId={workspace.id}
                  workspaceSlug={workspace.slug}
                  token={token}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <LeakHistory workspaceSlug={workspace.slug} />
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <WorkspaceUsersList
                  contributors={workspace.contributors}
                  owner={workspace.user}
                  workspaceSlug={workspace.slug}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT COLUMN: LEADERBOARD (1/3 width) */}
          <div className="space-y-4">
            <LeakLeaderboard workspaceSlug={workspace.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
