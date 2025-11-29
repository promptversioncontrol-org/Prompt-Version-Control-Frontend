import UserWorkspacesPage from '@/features/workspaces/components/user-workspaces-page';

interface PageProps {
  params:
    | {
        username: string;
      }
    | Promise<{
        username: string;
      }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <UserWorkspacesPage username={username} />;
}
