import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form';

export default async function NewOrganizationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-10">
      <CreateOrganizationForm userId={session.user.id} />
    </div>
  );
}
