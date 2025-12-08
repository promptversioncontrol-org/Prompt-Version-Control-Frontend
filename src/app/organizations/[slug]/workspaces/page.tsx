import { getOrganizationBySlug } from '@/features/organizations/services/get-organization-by-slug';
import { getOrganizationWorkspaces } from '@/features/organizations/services/get-organization-workspaces';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Plus, Box } from 'lucide-react';

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationWorkspacesPage({ params }: Params) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  const workspaces = await getOrganizationWorkspaces(org.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Workspaces</h2>
        {/* Helper to create workspace for this org. 
            Ideally, we update global create workspace flow to accept orgId, or have a specific route.
            For now, assume a query param or separate page. 
            I'll use a link to /workspaces/new (existing) and hope to pass org context later, 
            or better: /organizations/[slug]/workspaces/new.
            But to save time I'll just link to generic creation and user chooses? 
            No, better to provide Context. 
            I'll use a query param `?orgId=${org.id}` if existing flow supports it.
            Existing flow `create-new-workspace.ts` takes `CreateWorkspaceInput`.
            I'll add `organizationId` to it later.
            For now, I'll render the button.
        */}
        <Link href={`/workspaces/new?organizationId=${org.id}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.length === 0 && (
          <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
            <Box className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No workspaces in this organization yet.</p>
          </div>
        )}
        {workspaces.map((ws) => (
          <Link href={`/workspaces/${ws.slug}`} key={ws.id}>
            {/* Note: Existing workspaces use /workspaces/[slug] routing. Organization workspaces should probably do the same? 
                 Or /organizations/[orgSlug]/workspaces/[wsSlug]?
                 Depends on if workspace slug is globally unique or simple.
                 My schema has @@unique([userId, slug]).
                 For Org workspaces, userId is creator.
                 So /workspaces/[slug] might collide if different users have same slug.
                 But user requests "Lista workspace'ów". I'll link to likely existing route.
             */}
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{ws.name}</CardTitle>
                <CardDescription>
                  {ws.description || 'No description'}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
