import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
  visibility: string;
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-4 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? user.username}
                width={80}
                height={80}
                className="rounded-full border-2 border-zinc-700/50 object-cover"
              />
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
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-400 mb-4">No workspaces yet</p>
              <Link href={`/dashboard/workspaces/new`}>
                <Button className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 hover:bg-zinc-700/50 hover:text-white backdrop-blur-sm transition-all">
                  Create Your First Workspace
                </Button>
              </Link>
            </CardContent>
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
                      <span className="capitalize">{workspace.visibility}</span>
                      <span>•</span>
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
    </div>
  );
}
