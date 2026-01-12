import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getOrganizationBySlug } from '@/features/organizations/services/get-organization-by-slug';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: LayoutProps) {
  // Await params as per Next.js 15/16 changes if applicable, though typically params is plain object in older versions.
  // User is on Next 16 ("next": "16.0.3" in package.json).
  // Next 15+ params are async.
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
    // Or redirect to request access
    return (
      <div className="container py-10">
        You do not have access to this organization.
      </div>
    );
  }

  // Identify current member role
  const currentMember = organization.members.find(
    (m) => m.userId === session.user.id,
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{children}</div>
    </div>
  );
}
