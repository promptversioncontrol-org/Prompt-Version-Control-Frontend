import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { getOrganizationBySlug } from '@/features/organizations/services/get-organization-by-slug';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { InviteMemberForm } from '@/features/organizations/components/invite-member-form';

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationSettingsPage({ params }: Params) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect('/sign-in');

  const org = await getOrganizationBySlug(slug);

  if (!org) notFound();

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update your organization information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Form not implemented yet (Placeholder). You can edit name, logo,
            description.
          </p>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage users and roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {org.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                    {member.user.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteMemberForm
            organizationId={org.id}
            slug={slug}
            userId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
