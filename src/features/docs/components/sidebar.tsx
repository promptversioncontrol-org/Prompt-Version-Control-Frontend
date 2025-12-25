'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface DocsSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export function DocsSidebar({ isOpen, isMobile, onClose }: DocsSidebarProps) {
  const pathname = usePathname();

  const items = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', href: '/docs' },
        { title: 'Installation', href: '/docs#installation' },
        { title: 'Configuration', href: '/docs#configuration' },
      ],
    },
    {
      title: 'Commands',
      items: [
        { title: 'init', href: '/docs#init' },
        { title: 'update-conv', href: '/docs#update-conv' },
        { title: 'remote', href: '/docs#remote' },
        { title: 'generate', href: '/docs#generate' },
        { title: 'watch', href: '/docs#watch' },
        { title: 'login', href: '/docs#login' },
        { title: 'push', href: '/docs#push' },
        { title: 'risk', href: '/docs#risk' },
      ],
    },
    {
      title: 'Advanced',
      items: [
        { title: 'Policy Engine', href: '/docs/architecture' }, // Example link
        { title: 'CLI Internals', href: '/docs/cli' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/docs') return pathname === '/docs';
    return pathname.startsWith(href.split('#')[0]) && href !== '/docs';
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {(isOpen || !isMobile) && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
          )}

          <motion.aside
            initial={isMobile ? 'closed' : false}
            animate={isOpen ? 'open' : 'closed'}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed top-16 bottom-0 left-0 z-40 w-64 bg-black/95 border-r border-white/10 backdrop-blur-xl',
              'shadow-[10px_0_30px_-10px_rgba(0,0,0,0.5)]',
            )}
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

            <ScrollArea className="h-full py-8 pr-4 pl-6">
              {items.map((section, index) => (
                <div key={index} className="mb-10">
                  <h4 className="mb-4 text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase pl-3">
                    {section.title}
                  </h4>
                  <div className="grid gap-1 relative">
                    {/* Vertical Guide Line */}
                    <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-white/5"></div>

                    {section.items.map((item, i) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={i}
                          href={item.href}
                          className={cn(
                            'group block px-4 py-2 text-[13px] transition-all duration-200 rounded-r-md relative pl-5',
                            active
                              ? 'text-white font-medium'
                              : 'text-zinc-500 hover:text-zinc-300',
                          )}
                        >
                          {/* Active Indicator Line */}
                          {active && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
                          )}

                          {/* Hover Effect */}
                          <div
                            className={cn(
                              'absolute inset-0 bg-white/5 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity',
                              active && 'opacity-100 bg-white/[0.03]',
                            )}
                          ></div>

                          <span className="relative z-10">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="px-4 py-4 rounded-lg bg-white/5 border border-white/10">
                  <h5 className="text-xs font-bold text-white mb-2">
                    Need Help?
                  </h5>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    Join our Discord functionality for support.
                  </p>
                  <button className="w-full py-1.5 text-xs font-medium bg-white text-black rounded hover:bg-zinc-200 transition-colors">
                    Join Discord
                  </button>
                </div>
              </div>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
