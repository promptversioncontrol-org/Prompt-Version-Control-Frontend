import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  workspacesToCreate: z.array(z.string()).default([]),
  workspacesToLink: z.array(z.string()).default([]),
  invitations: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(['member', 'moderator', 'owner']),
      }),
    )
    .default([]),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
