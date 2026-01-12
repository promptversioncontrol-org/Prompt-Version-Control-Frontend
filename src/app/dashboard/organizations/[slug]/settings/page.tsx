'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SettingsRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  useEffect(() => {
    if (slug) {
      router.replace(`/dashboard/organizations/${slug}?tab=settings`);
    }
  }, [slug, router]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}
