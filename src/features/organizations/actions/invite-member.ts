'use server';

import { inviteMember } from '../services/invite-member';
import { revalidatePath } from 'next/cache';

export async function inviteMemberAction(
  organizationId: string,
  email: string,
  role: string,
  inviterId: string,
  slug: string,
) {
  await inviteMember(organizationId, email, role, inviterId);
  revalidatePath(`/organizations/${slug}/settings`);
}
