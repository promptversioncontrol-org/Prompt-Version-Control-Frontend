'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  FileEdit,
  MessageSquare,
  BrainCircuit,
  Cpu,
  AlertCircle,
  Search,
} from 'lucide-react';
import { TimelineItem } from '../../types/report-viewer.types';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';

interface SessionTimelineProps {
  items: TimelineItem[];
}

const getIcon = (category: string) => {
  switch (category) {
    case 'messages':
      return MessageSquare;
    case 'reasoning':
      return BrainCircuit;
    case 'tools':
      return Terminal;
    case 'meta':
      return Cpu;
    case 'files':
      return FileEdit; // Not standard in type but good to handle
    default:
      return AlertCircle;
  }
};

const getColor = (category: string) => {
  switch (category) {
    case 'messages':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'reasoning':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'tools':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'meta':
      return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    default:
      return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  }
};

export function SessionTimeline({ items }: SessionTimelineProps) {
  const [search, setSearch] = React.useState('');

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.preview?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm pb-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search events..."
            className="pl-9 bg-zinc-900 border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="relative border-l border-zinc-800 ml-4 space-y-6">
        {filtered.map((item, index) => {
          const Icon = getIcon(item.category);
          const colorClass = getColor(item.category);

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index > 20 ? 0 : index * 0.05 }}
              className="relative pl-8"
            >
              <div
                className={cn(
                  'absolute left-[-10px] top-1 p-1 rounded-full border bg-zinc-950',
                  colorClass,
                )}
              >
                <Icon size={12} />
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-lg p-3 hover:bg-zinc-900/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded',
                      colorClass,
                    )}
                  >
                    {item.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(item.tsMs).toLocaleTimeString()}
                    <span className="text-zinc-800 mx-1">•</span>
                    {item.tsMs}ms
                  </span>
                </div>

                <h3 className="text-sm font-medium text-zinc-200 mb-1">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-zinc-400 mb-2">{item.subtitle}</p>
                )}

                {item.preview && (
                  <div className="mt-2 text-xs font-mono text-zinc-500 bg-black/40 p-2 rounded border border-zinc-800/50 break-all">
                    {item.preview.slice(0, 150)}
                    {item.preview.length > 150 && '...'}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        <div className="text-center py-10 text-zinc-500">
          No events found matching &quot;{search}&quot;
        </div>
      </div>
    </div>
  );
}
