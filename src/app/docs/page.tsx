'use client';

import { useSearchParams } from 'next/navigation';
import { DocsView } from '@/features/docs/components/docs-view';
import { ApiView } from '@/features/docs/components/api-view';
import { Suspense } from 'react';

function DocsPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  if (tab === 'api') {
    return <ApiView />;
  }

  return <DocsView />;
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"></div>}>
      <DocsPageContent />
    </Suspense>
  );
}
