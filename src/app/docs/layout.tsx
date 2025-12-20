import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { DocsShell } from '@/features/docs/components/docs-shell';

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

      {/* Navbar - Bardziej szklany i z wyraźniejszą krawędzią */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/15 bg-black/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group relative">
              {/* Subtelny efekt neonu pod logo po najechaniu */}
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image
                src="/icon/logo.svg"
                alt="PVC"
                width={32}
                height={32}
                className="w-8 h-8 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              />
              <span className="font-bold tracking-tight text-xl text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-300 to-zinc-500 relative z-10">
                PVC
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
              <Link
                href="/docs"
                className="px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
              >
                Docs
              </Link>
              {/* Przykładowy drugi link */}
              <span className="px-4 py-1 text-zinc-500 text-sm cursor-not-allowed">
                API
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/promptversioncontrol-org"
              target="_blank"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <DocsShell>{children}</DocsShell>
    </div>
  );
}
