'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function OrganizationTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Workspaces', href: `/organizations/${slug}/workspaces` },
    { name: 'Settings', href: `/organizations/${slug}/settings` },
  ];

  return (
    <div className="flex items-center border-b">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(tab.href) || false;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
                        border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary
                        ${
                          isActive
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:border-gray-300'
                        }
                    `}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
