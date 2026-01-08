'use client';

import { DocsShell } from '@/features/docs/components/docs-shell';
import { DocsNavbar } from '@/features/docs/components/docs-navbar';
import { Suspense } from 'react';

function DocsLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/30 selection:text-white">
      {/* Visual Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-zinc-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 brightness-100 contrast-125"></div>
      </div>

      <DocsNavbar />

      <DocsShell>{children}</DocsShell>
    </div>
  );
}

export function DocsLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <DocsLayoutContent>{children}</DocsLayoutContent>
    </Suspense>
  );
}
