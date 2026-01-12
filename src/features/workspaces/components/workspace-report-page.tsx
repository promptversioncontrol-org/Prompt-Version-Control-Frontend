import { notFound } from 'next/navigation';
import { getWorkspaceBySlug } from '../services/get-workspace-by-slug';
import { getWorkspaceReport } from '../services/get-workspace-report';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import Link from 'next/link';

interface WorkspaceReportPageProps {
  username: string;
  workspaceSlug: string;
  date: string;
}

export default async function WorkspaceReportPage({
  username,
  workspaceSlug,
  date,
}: WorkspaceReportPageProps) {
  const workspace = await getWorkspaceBySlug(username, workspaceSlug);

  if (!workspace) {
    notFound();
  }

  let report: unknown = null;
  try {
    report = await getWorkspaceReport(workspace.id, workspace.userId, date);
  } catch {
    // If fetching fails, return 404 to align with routing expectations
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container max-w-4xl mx-auto py-10 px-4 relative z-10 space-y-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-2xl text-zinc-100">
              {workspace.name} / {date}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Link
                href={`/dashboard/workspaces/${workspace.slug}`}
                className="text-zinc-400 hover:text-zinc-200 underline-offset-4 hover:underline"
              >
                Back to workspace
              </Link>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-xl text-zinc-100">Report</CardTitle>
          </CardHeader>
          <CardContent>
            {report ? (
              <pre className="w-full overflow-auto rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 text-sm p-4">
                {JSON.stringify(report, null, 2)}
              </pre>
            ) : (
              <p className="text-zinc-400">No report data for this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
