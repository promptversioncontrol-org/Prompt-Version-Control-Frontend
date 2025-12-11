import { z } from 'zod';

export const createSshKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  publicKey: z
    .string()
    .min(1, 'Public key is required')
    .startsWith('ssh-', 'Invalid SSH key format'),
});

export type CreateSshKeyDto = z.infer<typeof createSshKeySchema>;

export interface SshKeyModel {
  id: string;
  name: string | null;
  fingerprint: string;
  createdAt: Date;
}
