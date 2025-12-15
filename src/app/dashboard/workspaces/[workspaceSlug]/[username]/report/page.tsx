'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportViewer from '@/features/workspaces/components/report-viewer';

import { useParams } from 'next/navigation';

function ReportContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const fileKey = searchParams?.get('key') || undefined;
  const workspaceSlug =
    typeof params?.workspaceSlug === 'string'
      ? params.workspaceSlug
      : undefined;
  const username =
    typeof params?.username === 'string' ? params.username : undefined;

  return (
    <ReportViewer
      initialFileKey={fileKey}
      workspaceSlug={workspaceSlug}
      username={username}
    />
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
