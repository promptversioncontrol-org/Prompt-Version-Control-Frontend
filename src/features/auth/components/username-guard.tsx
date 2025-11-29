'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/shared/lib/auth-client';

export function UsernameGuard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;

    // If user is logged in
    if (session?.user) {
      // Check if username is missing (null, undefined, or empty string)
      // Note: TypeScript might not know about 'username' if it's not in the default type,
      // but it should be there if it's in the database and better-auth returns it.
      // We cast to a custom type because better-auth adds it dynamically
      const user = session.user as { username?: string };
      console.log('UsernameGuard checking user:', user);

      const hasUsername = user.username && user.username.trim() !== '';

      // If no username and not already on the setup page
      if (!hasUsername && pathname !== '/setup-username') {
        router.replace('/setup-username');
      }

      // If user HAS username and tries to go to setup page, maybe redirect them away?
      // The user didn't ask for this, but it's good practice.
      // However, maybe they want to change it? The current setup page seems to be "Choose Your Username", implying initial setup.
      // Let's stick to the requirement: redirect TO setup if missing.
    }
  }, [session, isPending, pathname, router]);

  return null; // This component renders nothing
}
