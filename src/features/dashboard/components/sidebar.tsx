'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Key,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { authClient } from '@/shared/lib/auth-client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      title: 'Workspaces',
      href: '/dashboard/workspaces',
      icon: LayoutDashboard,
    },
    {
      title: 'SSH Keys',
      href: '/dashboard/ssh',
      icon: Key,
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <div
      className={cn(
        'relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        className,
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full p-1 hover:text-white hover:bg-zinc-700 transition-colors z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </div>
        <span
          className={cn(
            'font-bold text-xl text-white whitespace-nowrap transition-opacity duration-300',
            isCollapsed ? 'opacity-0 w-0' : 'opacity-100',
          )}
        >
          PVC
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 group-hover:text-white',
                )}
              />
              <span
                className={cn(
                  'whitespace-nowrap transition-all duration-300',
                  isCollapsed
                    ? 'opacity-0 w-0 translate-x-10 overflow-hidden'
                    : 'opacity-100 translate-x-0',
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-zinc-800">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 justify-start text-zinc-400 hover:text-red-400 hover:bg-red-950/20',
            isCollapsed && 'justify-center px-0',
          )}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={cn(
              'whitespace-nowrap transition-all duration-300',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100',
            )}
          >
            Sign Out
          </span>
        </Button>
      </div>
    </div>
  );
}
