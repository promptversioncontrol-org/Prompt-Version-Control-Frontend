import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { DocsShell } from '@/features/docs/components/docs-shell';
import { DocsNavbar } from '@/features/docs/components/docs-navbar';

export const metadata: Metadata = {
  title: 'Documentation - PVC',
  description: 'Documentation for Prompt Version Control CLI',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Ustawienie koloru zaznaczenia tekstu na srebrny/biały
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/30 selection:text-white">
      {/* NOWE TŁO: Srebrno-czarno-szary gradient z efektem szkła */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Srebrna poświata z góry */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full mix-blend-overlay"></div>
        {/* Szara/dymna poświata z dołu */}
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-zinc-500/10 blur-[130px] rounded-full"></div>
        {/* Ziarno dla tekstury */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 brightness-100 contrast-125"></div>
      </div>

      <DocsNavbar />

      <DocsShell>{children}</DocsShell>
    </div>
  );
}
