'use client';

import { Card } from '@/shared/components/ui/card';

const SERVICES = [
  { name: 'API Gateway', status: 'operational' },
  { name: 'CLI Registry', status: 'operational' },
  { name: 'Proxy Network', status: 'operational' },
  { name: 'Dashboard', status: 'degraded' }, // Przykładowy stan "degraded"
];

export function SystemStatus() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {SERVICES.map((service) => (
        <Card
          key={service.name}
          className="bg-zinc-900/30 border-zinc-800 p-4 flex items-center justify-between group hover:border-zinc-700 transition-all"
        >
          <span className="text-sm font-medium text-zinc-300">
            {service.name}
          </span>
          <div className="flex items-center gap-2">
            {service.status === 'operational' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-500 font-mono hidden group-hover:block transition-all">
                  UP
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-xs text-amber-500 font-mono hidden group-hover:block">
                  WARN
                </span>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
