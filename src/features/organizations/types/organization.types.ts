import { Organization } from '@prisma/client';

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  image?: string;
  website?: string;
  industry?: string;
  userId: string; // Creator
  contributors?: { email: string; role: string }[];
  createDefaultWorkspaces?: boolean;
}

export type OrganizationWithDetails = Organization & {
  _count: {
    workspaces: number;
    members: number;
  };
};
