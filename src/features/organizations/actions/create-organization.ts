'use server';

import { createOrganization } from '../services/create-organization';
import type { CreateOrganizationInput } from '../types/organization.types';
import { redirect } from 'next/navigation';

export async function createOrganizationAction(data: CreateOrganizationInput) {
  const org = await createOrganization(data);
  redirect(`/dashboard/organizations/${org.slug}/workspaces`);
}
