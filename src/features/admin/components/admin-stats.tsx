import { Card, CardContent } from '@/shared/components/ui/card';
import { Ticket } from '../actions/get-tickets';
import { Inbox, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export function AdminStats({ tickets }: { tickets: Ticket[] }) {
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'OPEN').length;
  const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const items = [
    {
      label: 'Total Tickets',
      value: total,
      icon: Inbox,
      color: 'text-zinc-100',
      bg: 'bg-zinc-900',
    },
    {
      label: 'Pending Action',
      value: open,
      icon: AlertCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="bg-zinc-950 border-zinc-800 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-white">{item.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${item.bg} border border-white/5`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
