import { z } from 'zod';

export const workspaceContributorSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['co-owner', 'moderator', 'member']),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  description: z.string().optional(),
  contributors: z.array(workspaceContributorSchema),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type WorkspaceContributorDto = z.infer<
  typeof workspaceContributorSchema
>;
