import WorkspaceReportPage from '@/features/workspaces/components/WorkspaceReportPage';

interface PageProps {
  params:
    | {
        username: string;
        workspace: string;
        date: string;
      }
    | Promise<{
        username: string;
        workspace: string;
        date: string;
      }>;
}

export default async function WorkspaceDatePage({ params }: PageProps) {
  const { username, workspace, date } = await params;
  return (
    <WorkspaceReportPage
      username={username}
      workspaceSlug={workspace}
      date={date}
    />
  );
}
