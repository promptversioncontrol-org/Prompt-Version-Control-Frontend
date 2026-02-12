// /lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { createUserFolder } from '../../features/auth/services/user-file-structure-service';
import { twoFactor } from 'better-auth/plugins';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createUserFolder(user.id);
        },
      },
    },
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: 'PVC',
    }),
  ],
});
