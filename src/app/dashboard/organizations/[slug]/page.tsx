import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getOrganizationBySlug } from '@/features/organizations/services/get-organization-by-slug';
import { getOrganizationWorkspaces } from '@/features/organizations/services/get-organization-workspaces';
import { getOrganizationMembersWithAccess } from '@/features/organizations/actions/manage-workspace-access';
import { getOrganizationRolesAction } from '@/features/organizations/actions/manage-roles';
import { OrganizationDashboard } from '@/features/organizations/components/organization-dashboard';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrganizationPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const organization = await getOrganizationBySlug(slug);

  if (!organization) {
    return notFound();
  }

  // Check membership
  const isMember = organization.members.some(
    (m) => m.userId === session.user.id,
  );

  if (!isMember) {
    return (
      <div className="container py-10 text-center text-zinc-400">
        You do not have access to this organization.
      </div>
    );
  }

  // Fetch Workspaces
  const workspaces = await getOrganizationWorkspaces(organization.id);

  // Fetch Members
  const { members } = await getOrganizationMembersWithAccess(organization.id);
  const { roles: fetchedRoles } = await getOrganizationRolesAction(
    organization.id,
  );

  if (!members) {
    return <div>Error loading members.</div>;
  }

  // Provide client-friendly member objects
  const clientMembers = members.map((m) => ({
    id: m.id,
    role: m.role,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      contributions: m.user.contributions,
    },
  }));

  const { tab } = await searchParams;

  return (
    <OrganizationDashboard
      organization={organization}
      workspaces={workspaces}
      members={clientMembers}
      roles={fetchedRoles || []}
      currentUserId={session.user.id}
      initialTab={tab}
    />
  );
}
