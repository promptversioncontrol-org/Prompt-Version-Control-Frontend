import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserOrganizations } from '@/features/organizations/services/get-user-organizations';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Plus, Users, Layout, ArrowRight, Command } from 'lucide-react';

export default async function OrganizationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const organizations = await getUserOrganizations(session.user.id);

  // Helper do inicjałów
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container relative z-10 mx-auto py-12 px-4 sm:px-6 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Organizations
          </h1>
          <p className="text-zinc-400 mt-2 text-base">
            Manage your organizations and workspaces.
          </p>
        </div>

        <Link href="/dashboard/organizations/new">
          <Button className="bg-white text-black hover:bg-zinc-200 transition-all font-medium px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </Link>
      </div>

      {/* GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* EMPTY STATE - Monochromatyczny */}
        {organizations.length === 0 && (
          <div className="col-span-full">
            <div className="border border-dashed border-zinc-800 bg-zinc-900/20 rounded-xl p-12 text-center flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Command className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-medium text-zinc-200 mb-2">
                No organizations yet
              </h3>
              <p className="text-zinc-500 max-w-sm mb-8 text-sm">
                Start by creating an organization to group your workspaces and
                team members.
              </p>
              <Link href="/dashboard/organizations/new">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* LISTA ORGANIZACJI */}
        {organizations.map((org) => (
          <Link
            href={`/dashboard/organizations/${org.slug}/workspaces`}
            key={org.id}
            className="group block h-full"
          >
            <Card className="h-full bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/60 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-start space-y-0 pb-4 gap-4 border-b border-zinc-800/50">
                {/* Avatar: Ciemny gradient (Zinc), zero koloru */}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center text-zinc-200 font-bold text-sm shadow-inner shrink-0 group-hover:border-zinc-500/50 transition-colors">
                  {getInitials(org.name)}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <CardTitle className="text-base font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                    {org.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 font-mono mt-1">
                    /{org.slug}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="py-5 flex-grow">
                <p className="text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {org.description || 'No description provided.'}
                </p>
              </CardContent>

              {/* Footer ze statystykami */}
              <div className="px-6 py-4 bg-zinc-950/30 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    <Layout className="h-3.5 w-3.5" />
                    <span>{org._count.workspaces}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    <Users className="h-3.5 w-3.5" />
                    <span>{org._count.members}</span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
