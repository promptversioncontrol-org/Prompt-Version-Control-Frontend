'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DocsSidebar } from './sidebar';
import { cn } from '@/shared/lib/utils';

interface DocsShellProps {
  children: React.ReactNode;
}

export function DocsShell({ children }: DocsShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProxyTab = searchParams?.get('tab') === 'proxy';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024 || isProxyTab) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isProxyTab]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      // Defer state update to avoid synchronous setState warning during render/effect cycle
      const timeout = setTimeout(() => {
        setIsSidebarOpen(false);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [pathname, isMobile]);

  return (
    <div className="flex min-h-screen bg-black relative selection:bg-white/20 selection:text-white">
      {/* Background Effects (copied from landing page style but cleaner for docs) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-3 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Toggle Button (Rail) */}
      <motion.button
        initial={false}
        animate={{ left: isSidebarOpen ? 256 : 0, opacity: isMobile ? 0 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          'hidden lg:flex fixed top-24 z-40 p-1.5 bg-black border border-white/10 rounded-r-md text-zinc-400 hover:text-white transition-colors',
          isProxyTab && 'hidden',
        )}
        style={{ left: isSidebarOpen ? '16rem' : '0' }}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </motion.button>

      {/* Sidebar */}
      <DocsSidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <motion.div
        layout
        initial={false}
        animate={{
          marginLeft: isSidebarOpen && !isMobile ? 256 : 0,
          width: isSidebarOpen && !isMobile ? 'calc(100% - 256px)' : '100%',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 relative z-10 min-w-0"
      >
        <div className="max-w-4xl mx-auto px-6 py-12 md:px-12 md:py-20 lg:px-16">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
