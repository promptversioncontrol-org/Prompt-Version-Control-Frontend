import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkspaceBySlug } from '../services/get-workspace-by-slug';
import { listWorkspaceReportDates } from '../services/list-workspace-report-dates';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Settings,
  Calendar,
  ChevronRight,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { LiveStreamFeed } from './live-stream-feed';

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

  const dates = await listWorkspaceReportDates(
    workspace.userId,
    workspace.slug,
  );

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
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {workspace.name}
              </h1>
              <Badge
                variant="outline"
                className="capitalize border-zinc-700 bg-zinc-900/50 text-zinc-400 px-2 py-0.5 text-xs font-mono"
              >
                {workspace.visibility}
              </Badge>
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
            <div className="text-2xl font-mono font-bold text-white">24</div>
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
            <div className="flex items-center justify-between">
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
          </div>

          {/* RIGHT COLUMN: REPORTS (1/3 width) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Audit Reports
              </h2>
            </div>

            <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm h-[500px] flex flex-col">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-500">
                  History by date
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {dates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                    <Calendar size={32} className="opacity-20" />
                    <p className="text-sm">No reports yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dates.map((date) => (
                      <Link
                        key={date}
                        href={`/dashboard/workspaces/${workspace.slug}/${date}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between p-3 rounded-md border border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all">
                          <span className="text-sm font-mono text-zinc-300 group-hover:text-white transition-colors">
                            {date}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
