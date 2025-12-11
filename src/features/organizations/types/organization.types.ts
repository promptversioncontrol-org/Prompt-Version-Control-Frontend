import { Organization } from '@prisma/client';

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  website?: string;
  industry?: string;
  userId: string; // Creator
  invitations?: { email: string; role: string }[];
  workspacesToCreate?: string[];
  workspacesToLink?: string[];
  createDefaultWorkspaces?: boolean; // Deprecated but kept for compatibility if needed, or remove
}

export type OrganizationWithDetails = Organization & {
  _count: {
    workspaces: number;
    members: number;
  };
};
