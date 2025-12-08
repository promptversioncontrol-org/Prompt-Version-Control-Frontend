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
import { Building2, Plus } from 'lucide-react';

export default async function OrganizationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const organizations = await getUserOrganizations(session.user.id);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organizations and workspaces.
          </p>
        </div>
        <Link href="/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-lg border border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">No organizations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first organization to get started.
            </p>
            <Link href="/organizations/new">
              <Button>Create Organization</Button>
            </Link>
          </div>
        )}

        {organizations.map((org) => (
          <Link href={`/organizations/${org.slug}/workspaces`} key={org.id}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {org.name}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {org.description || 'No description'}
                </CardDescription>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      {org._count.workspaces}
                    </span>{' '}
                    Workspaces
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      {org._count.members}
                    </span>{' '}
                    Members
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
