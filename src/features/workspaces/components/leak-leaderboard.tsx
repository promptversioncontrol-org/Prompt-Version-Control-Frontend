'use client';

import React, { useEffect, useState } from 'react';
import {
  getLeakLeaderboard,
  LeaderboardEntry,
} from '../actions/get-leak-leaderboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/components/ui/card';
import { Trophy, Medal, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LeakLeaderboardProps {
  workspaceSlug: string;
}

export function LeakLeaderboard({ workspaceSlug }: LeakLeaderboardProps) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const result = await getLeakLeaderboard(workspaceSlug);
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [workspaceSlug]);

  // Funkcja pomocnicza do styli rankingu
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 1:
        return 'bg-zinc-400/10 border-zinc-400/30 text-zinc-300';
      case 2:
        return 'bg-amber-700/10 border-amber-700/30 text-amber-600';
      default:
        return 'bg-zinc-900/50 border-zinc-800 text-zinc-500';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500 drop-shadow-md" />;
      case 1:
        return <Medal className="h-5 w-5 text-zinc-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="font-mono text-sm font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
          Risk Leaderboard
        </h2>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          Top Security Risks
        </p>
      </div>

      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-md shadow-xl h-[500px] flex flex-col overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
          <CardDescription className="text-zinc-400 text-center flex flex-col items-center gap-2">
            <span className="bg-zinc-900 px-3 py-1 rounded-full text-xs border border-zinc-800">
              Top offenders by total leaks
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Analyzing risk data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
              <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-dashed border-zinc-700">
                <ShieldAlert className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-sm">No leaks recorded yet. Good job!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((entry, index) => (
                <div
                  key={entry.username}
                  className={cn(
                    'relative group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]',
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/5 to-transparent border-yellow-500/20 shadow-[0_0_15px_-3px_rgba(234,179,8,0.1)]'
                      : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700',
                  )}
                >
                  {/* Left Side: Rank + User */}
                  <div className="flex items-center gap-4">
                    {/* Rank Circle */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border shadow-sm',
                        getRankStyles(index),
                      )}
                    >
                      {getRankIcon(index)}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          'text-sm font-semibold tracking-tight',
                          index === 0 ? 'text-yellow-100' : 'text-zinc-200',
                        )}
                      >
                        {entry.username}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] text-yellow-500/80 font-medium uppercase tracking-wider">
                          Highest Risk
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Count */}
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        'text-lg font-mono font-bold leading-none',
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                            ? 'text-zinc-300'
                            : index === 2
                              ? 'text-amber-600'
                              : 'text-zinc-500',
                      )}
                    >
                      {entry.count}
                    </span>
                    <span className="text-[10px] text-zinc-600 uppercase font-medium">
                      Leaks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
