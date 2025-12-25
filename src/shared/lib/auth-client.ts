// /lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [twoFactorClient(), passkeyClient()],
});

export const { signIn, signUp, signOut, useSession, twoFactor, passkey } =
  authClient;
