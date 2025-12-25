'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Suspense } from 'react';

function DocsNavbarContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'docs';

  const tabs = [
    { name: 'Docs', href: '/docs' },
    { name: 'API', href: '/docs?tab=api' },
  ];

  const isActive = (href: string) => {
    if (href === '/docs') return currentTab === 'docs';
    if (href === '/docs?tab=api') return currentTab === 'api';
    if (href === '/docs?tab=proxy') return currentTab === 'proxy';
    return false;
  };

  return (
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
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    'relative px-4 py-1 rounded-full text-sm font-medium transition-colors z-10',
                    active ? 'text-white' : 'text-zinc-400 hover:text-white',
                  )}
                  replace // Use replace to avoid filling history stack
                  scroll={false} // Prevent scroll reset
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-white/10 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-20">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href="https://github.com/promptversioncontrol-org/Prompt-Version-Control-CLI"
            target="_blank"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

export function DocsNavbar() {
  return (
    <Suspense
      fallback={<nav className="fixed top-0 w-full z-50 h-16 bg-black" />}
    >
      <DocsNavbarContent />
    </Suspense>
  );
}
