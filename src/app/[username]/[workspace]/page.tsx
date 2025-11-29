import WorkspaceOverviewPage from '@/features/workspaces/components/WorkspaceOverviewPage';

interface PageProps {
  params:
    | {
        username: string;
        workspace: string;
      }
    | Promise<{
        username: string;
        workspace: string;
      }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { username, workspace } = await params;
  return (
    <WorkspaceOverviewPage username={username} workspaceSlug={workspace} />
  );
}
