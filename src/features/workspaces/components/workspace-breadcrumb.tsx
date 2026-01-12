'use client';

import Link from 'next/link';
import { Settings, FolderKanban } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface WorkspaceBreadcrumbProps {
  workspaceSlug: string;
}

export function WorkspaceBreadcrumb({
  workspaceSlug,
}: WorkspaceBreadcrumbProps) {
  const pathname = usePathname() || '';
  const segments = pathname.split('/').filter(Boolean);

  // Find where 'workspaces' and the slug is to determine context
  // url: /dashboard/workspaces/[slug]/[username]
  const isSettings = segments.includes('settings');
  const lastSegment = segments[segments.length - 1];

  // Try to determine if last segment is a username or 'settings'
  // If it's not 'settings' and not the workspace slug, it's likely a username
  const isUserPage =
    lastSegment !== workspaceSlug &&
    lastSegment !== 'settings' &&
    lastSegment !== 'workspaces';

  return (
    <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 font-mono text-sm text-zinc-400">
      <Link
        href={`/dashboard/workspaces/${workspaceSlug}`}
        className="flex items-center hover:text-white transition-colors"
      >
        <div className="mr-2 text-emerald-500">~/</div>
        <FolderKanban className="w-4 h-4 mr-2" />
        {workspaceSlug}
      </Link>

      {isSettings && (
        <>
          <span className="mx-2 text-zinc-600">&gt;</span>
          <div className="flex items-center text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            settings
          </div>
        </>
      )}

      {isUserPage && (
        <>
          <span className="mx-2 text-zinc-600">&gt;</span>
          <div className="flex items-center text-zinc-200">@{lastSegment}</div>
        </>
      )}
    </div>
  );
}
