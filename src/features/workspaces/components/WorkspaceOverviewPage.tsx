import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkspaceBySlug } from '../services/get-workspace-by-slug';
import { listWorkspaceReportDates } from '../services/list-workspace-report-dates';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface WorkspaceOverviewPageProps {
  username: string;
  workspaceSlug: string;
}

export default async function WorkspaceOverviewPage({
  username,
  workspaceSlug,
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container max-w-4xl mx-auto py-10 px-4 relative z-10 space-y-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl text-zinc-100">
                {workspace.name}
              </CardTitle>
              <Badge
                variant="outline"
                className="capitalize border-zinc-700/60 text-zinc-300"
              >
                {workspace.visibility}
              </Badge>
            </div>
            <p className="text-zinc-400">
              {workspace.description || 'No description provided.'}
            </p>
            <p className="text-sm text-zinc-500">
              Created:{' '}
              {new Date(workspace.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-xl text-zinc-100">
              Reports by date
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dates.length === 0 ? (
              <p className="text-zinc-400">
                No reports found for this workspace.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {dates.map((date) => (
                  <Link
                    key={date}
                    href={`/${username}/${workspace.slug}/${date}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all">
                      <span>{date}</span>
                      <span className="text-sm text-zinc-500">View report</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
