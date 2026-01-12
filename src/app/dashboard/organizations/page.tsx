import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserOrganizations } from '@/features/organizations/services/get-user-organizations';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Plus, Users, Layout, ArrowUpRight, Building2 } from 'lucide-react';

export default async function OrganizationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const organizations = await getUserOrganizations(session.user.id);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
      <div className="relative z-10 container mx-auto py-16 px-6 max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Organizations
            </h1>
            <p className="text-zinc-400 text-lg">
              Manage your teams and workspace access.
            </p>
          </div>
          <Link href="/dashboard/organizations/new">
            <Button className="bg-white text-black hover:bg-zinc-200 h-11 px-6 rounded-full font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </Link>
        </div>

        {/* EMPTY STATE */}
        {organizations.length === 0 ? (
          <div className="border border-dashed border-zinc-800 bg-zinc-900/10 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
              <Building2 className="h-10 w-10 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No organizations found
            </h3>
            <p className="text-zinc-500 max-w-md mb-8 text-base">
              Organizations allow you to group workspaces and manage team
              permissions centrally.
            </p>
            <Link href="/dashboard/organizations/new">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-11 px-8 rounded-full"
              >
                Create your first organization
              </Button>
            </Link>
          </div>
        ) : (
          /* GRID */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link
                href={`/dashboard/organizations/${org.slug}/workspaces`}
                key={org.id}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10 blur-xl" />

                <div className="h-full bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-bold shadow-inner">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight className="text-zinc-500 w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors mb-1 truncate">
                      {org.name}
                    </h3>
                    <p className="text-sm text-zinc-500 font-mono truncate">
                      /{org.slug}
                    </p>
                    {org.description && (
                      <p className="text-sm text-zinc-400 mt-4 line-clamp-2 leading-relaxed">
                        {org.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center gap-4 pt-6 border-t border-zinc-900">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <Layout className="h-3.5 w-3.5" />
                      <span>{org._count.workspaces} Workspaces</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <Users className="h-3.5 w-3.5" />
                      <span>{org._count.members} Members</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
