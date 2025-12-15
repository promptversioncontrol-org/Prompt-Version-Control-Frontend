import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

interface SessionFindingsProps {
  findings: unknown;
}

// Helper to try and infer severity
const getSeverityColor = (item: Record<string, unknown>) => {
  const s = String(
    item.severity || item.level || item.type || '',
  ).toLowerCase();
  if (s.includes('critical') || s.includes('high') || s.includes('error'))
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (s.includes('medium') || s.includes('warn'))
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (s.includes('low') || s.includes('info'))
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
};

const FindingItem = ({
  item,
  index,
}: {
  item: Record<string, unknown>;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const colorClass = getSeverityColor(item);

  const title =
    (item.title as string) ||
    (item.name as string) ||
    (item.id as string) ||
    `Finding #${index + 1}`;
  const description =
    (item.description as string) ||
    (item.message as string) ||
    (item.summary as string);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={cn(
          'border rounded-lg overflow-hidden transition-all',
          expanded
            ? 'bg-zinc-900/50 border-zinc-700'
            : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700',
        )}
      >
        <div
          className="p-4 flex items-start gap-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
            <AlertTriangle size={18} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h3 className="font-medium text-zinc-200 text-sm truncate">
                {title}
              </h3>
              {(item.severity as string) && (
                <Badge
                  variant="outline"
                  className={cn('capitalize text-xs', colorClass)}
                >
                  {String(item.severity)}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="text-zinc-600 shrink-0 pt-1">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pl-[72px] border-t border-zinc-800/50 pt-4">
                <pre className="text-xs font-mono text-zinc-400 bg-black/40 p-4 rounded-lg overflow-x-auto border border-zinc-800/50">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export function SessionFindings({ findings }: SessionFindingsProps) {
  const [search, setSearch] = useState('');

  // Normalize findings to an array if possible
  const items = (
    Array.isArray(findings)
      ? findings
      : Array.isArray((findings as { findings?: unknown[] })?.findings)
        ? (findings as { findings?: unknown[] }).findings
        : []
  ) as Record<string, unknown>[];

  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(search.toLowerCase()),
  );

  if (!items.length) {
    if (findings && Object.keys(findings as object).length > 0) {
      // If it's an object but not a recognized array structure, just dump it
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 mb-6">
            <Info size={18} />
            <span className="text-sm">
              Unstructured findings data detected. Displaying raw content.
            </span>
          </div>
          <pre className="text-xs font-mono text-zinc-400 bg-zinc-950 p-6 rounded-xl border border-zinc-800 overflow-auto">
            {JSON.stringify(findings, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
        <ShieldCheck size={48} className="mb-4 opacity-20" />
        <p>No findings available for this session.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search findings..."
            className="pl-9 bg-zinc-900 border-zinc-800 focus:border-zinc-700 transition-all font-mono text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs font-mono text-zinc-500">
          {filtered.length} Items
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <FindingItem key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
