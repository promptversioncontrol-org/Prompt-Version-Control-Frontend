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
  Building2,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { authClient, useSession } from '@/shared/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

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
    {
      title: 'Organizations',
      href: '/dashboard/organizations',
      icon: Building2,
    },
    {
      title: 'Support',
      href: '/dashboard/support',
      icon: LifeBuoy,
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
        isCollapsed ? 'w-20' : 'w-72',
        className,
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-zinc-900 border border-zinc-700 text-zinc-400 rounded-full p-1.5 hover:text-white hover:bg-zinc-800 transition-all z-50 shadow-xl"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Logo Area */}
      <div className="p-6 flex items-center gap-4 overflow-hidden border-b border-zinc-900">
        <div className="flex-shrink-0 relative group cursor-pointer">
          <div className="absolute -inset-1 bg-white rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-zinc-900 rounded-lg p-2 ring-1 ring-zinc-800">
            <Image
              src="/icon/logo.svg"
              alt="Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
        </div>
        <div
          className={cn(
            'flex flex-col transition-opacity duration-300',
            isCollapsed ? 'opacity-0 w-0' : 'opacity-100',
          )}
        >
          <span className="font-bold text-lg text-white whitespace-nowrap tracking-tight">
            PVC
          </span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            Enterprise
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-zinc-900/80 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent',
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
              )}
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors relative z-10',
                  isActive
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                    : 'text-zinc-500 group-hover:text-zinc-300',
                )}
              />
              <span
                className={cn(
                  'whitespace-nowrap font-medium text-sm transition-all duration-300 relative z-10',
                  isCollapsed
                    ? 'opacity-0 w-0 translate-x-10 overflow-hidden'
                    : 'opacity-100 translate-x-0',
                )}
              >
                {item.title}
              </span>
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all group',
            isCollapsed ? 'justify-center p-2' : '',
          )}
        >
          {session ? (
            <>
              <Avatar
                className="h-9 w-9 border border-zinc-700 shadow-sm shrink-0"
                withSantaHat
              >
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-bold">
                  {(session.user.name?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex-1 min-w-0 transition-all duration-300',
                  isCollapsed
                    ? 'w-0 opacity-0 overflow-hidden'
                    : 'w-auto opacity-100',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-200 truncate pr-2">
                    {session.user.name}
                  </p>
                  {/* Plan Badge */}
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded border font-mono capitalize transition-all',
                      (session.user as { plan?: string }).plan === 'premium'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    )}
                  >
                    {(session.user as { plan?: string }).plan || 'Free'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {session.user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className={cn(
                  'h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg shrink-0 transition-colors',
                  isCollapsed ? 'hidden' : 'flex',
                )}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            // Skeleton / Loading State
            <div className="flex items-center gap-3 w-full animate-pulse">
              <div className="h-9 w-9 rounded-full bg-zinc-800 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-zinc-800 rounded" />
                  <div className="h-2 w-28 bg-zinc-800 rounded" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
