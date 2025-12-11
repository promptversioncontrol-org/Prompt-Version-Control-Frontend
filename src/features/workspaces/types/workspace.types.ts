export interface WorkspaceContributorInput {
  username: string;
  role: 'co-owner' | 'moderator' | 'member';
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  userId: string;
  contributors?: WorkspaceContributorInput[];
}

export interface CreateWorkspaceResponse {
  id: string;
  name: string | null;
  slug: string;
  description: string | null;
  createdAt: Date;
  userId: string;
}
