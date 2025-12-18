import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import { getUserWithWorkspaces } from '../services/get-user-with-workspaces';

interface UserWorkspacesPageProps {
  username: string;
}

// ... imports

interface Workspace {
  id: string;
  name: string | null;
  slug: string;
  description: string | null;
  createdAt: Date;
}

interface UserWithWorkspaces {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  workspacesOwned: Workspace[];
}

export default async function UserWorkspacesPage({
  username,
}: UserWorkspacesPageProps) {
  const user = (await getUserWithWorkspaces(
    username,
  )) as UserWithWorkspaces | null;

  if (!user) {
    notFound();
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 relative z-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {user.image && (
            <Avatar
              className="h-20 w-20 rounded-full border-2 border-zinc-700/50"
              withSantaHat
            >
              <AvatarImage
                src={user.image || undefined}
                alt={user.name ?? user.username ?? 'User Avatar'}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-zinc-800 text-zinc-400">
                {(user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {user.name}
            </h1>
            <p className="text-zinc-400 text-lg">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-200">Workspaces</h2>
        <Link href={`/dashboard/workspaces/new`}>
          <Button className="bg-gradient-to-r from-zinc-100 to-white hover:from-white hover:to-zinc-100 text-black font-medium shadow-lg shadow-white/10 transition-all">
            Create Workspace
          </Button>
        </Link>
      </div>

      {user.workspacesOwned.length === 0 ? (
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-dashed border-2 border-zinc-800/50 flex flex-col items-center text-center p-12">
          <div className="h-16 w-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <LayoutDashboard className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No workspaces found
          </h3>
          <p className="text-zinc-400 mb-8 max-w-sm">
            You haven&apos;t created any workspaces yet. Get started by creating
            your first workspace to organize your prompts.
          </p>
          <Link href={`/dashboard/workspaces/new`}>
            <Button className="bg-gradient-to-r from-zinc-100 to-white hover:from-white hover:to-zinc-100 text-black font-medium shadow-lg shadow-white/10 transition-all px-8 py-6 h-auto text-base">
              Create Your First Workspace
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {user.workspacesOwned.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/dashboard/workspaces/${workspace.slug}`}
            >
              <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 hover:border-zinc-700/50 transition-all cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-zinc-100">
                    {workspace.name}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {workspace.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
