'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Activity,
  Pause,
  Play,
  Trash2,
  Terminal,
  User,
  Clock,
  Code2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface LiveStreamFeedProps {
  workspaceId: string;
  workspaceSlug: string; // Możesz to zostawić jeśli używasz do linków, ale do socketa nie jest już potrzebne
  token?: string;
}

interface LeakReport {
  id: string;
  sessionId: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  snippet: string;
  source: string;
  timestamp: string;
  username: string;
}

// --- COMPONENTS ---

const CRTOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
    style={{
      backgroundImage:
        'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
      backgroundSize: '100% 2px, 3px 100%',
    }}
  />
);

// RADAR
const RadarScanner = () => (
  <div className="flex flex-col items-center justify-center w-full min-h-[300px] relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-3xl"></div>

    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-[200px] h-[200px] rounded-full border-[2px] border-transparent animate-[spin_3s_linear_infinite]"
        style={{
          borderTopColor: '#10b981',
          borderRightColor: 'rgba(16, 185, 129, 0.2)',
        }}
      ></div>
      <div className="absolute w-[200px] h-[200px] rounded-full border border-zinc-800/30"></div>
      <div
        className="absolute w-[140px] h-[140px] rounded-full border-[2px] border-transparent animate-[spin_4s_linear_infinite_reverse]"
        style={{
          borderBottomColor: '#10b981',
          borderLeftColor: 'rgba(16, 185, 129, 0.2)',
        }}
      ></div>
      <div className="absolute w-[140px] h-[140px] rounded-full border border-zinc-800/30"></div>
      <div className="relative z-10 bg-[#09090b] p-4 rounded-full border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <ShieldCheck size={32} className="text-emerald-500" />
      </div>
    </div>

    <p className="text-xs font-mono mt-8 text-emerald-500/70 animate-pulse tracking-widest">
      SYSTEM_SECURE // MONITORING_ACTIVE
    </p>
  </div>
);

const LogItem = ({ report }: { report: LeakReport }) => {
  const isHigh = report.severity === 'high';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative overflow-hidden rounded-md border p-3 transition-all text-left',
        isHigh
          ? 'bg-red-950/10 border-red-500/30 hover:border-red-500/50'
          : report.severity === 'medium'
            ? 'bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40'
            : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700',
      )}
    >
      {isHigh && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex gap-4 relative z-10">
        <div className="flex flex-col items-center gap-2 pt-1">
          <div
            className={cn(
              'p-2 rounded-lg border shadow-[0_0_10px_rgba(0,0,0,0.2)]',
              isHigh
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : report.severity === 'medium'
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400',
            )}
          >
            {isHigh ? (
              <ShieldAlert size={16} />
            ) : report.severity === 'medium' ? (
              <Shield size={16} />
            ) : (
              <Activity size={16} />
            )}
          </div>
          <div className="h-full w-px bg-zinc-800 group-last:hidden" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-zinc-300 font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                <User size={10} /> {report.username}
              </span>
              <span className="text-zinc-500 flex items-center gap-1">
                via{' '}
                <span className="text-zinc-400 font-semibold">
                  {report.source}
                </span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-zinc-500 font-mono">
              <Clock size={10} />
              {new Date(report.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div>
            <p
              className={cn(
                'text-sm font-medium',
                isHigh ? 'text-red-200' : 'text-zinc-300',
              )}
            >
              {report.message}
            </p>
          </div>

          {report.snippet && (
            <div className="relative mt-2 rounded bg-black border border-zinc-800/80 overflow-hidden">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/50 border-b border-zinc-800/50">
                <Code2 size={10} className="text-zinc-500" />
                <span className="text-[10px] text-zinc-500 font-mono">
                  intercepted_payload.txt
                </span>
              </div>
              <pre className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
                <code className={cn(isHigh ? 'text-red-300' : 'text-zinc-300')}>
                  {report.snippet}
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

export function LiveStreamFeed({
  workspaceId,
  workspaceSlug,
  token,
}: LiveStreamFeedProps) {
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pendingReports = useRef<LeakReport[]>([]);

  useEffect(() => {
    if (!token) return;

    const socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      auth: { token, workspaceId },
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('dashboard:leak_alert', (rawReport: Omit<LeakReport, 'id'>) => {
      console.log('Frontend received leak alert:', rawReport);
      const report = { ...rawReport, id: crypto.randomUUID() };

      if (isPaused) {
        pendingReports.current.push(report);
      } else {
        setReports((prev) => [report, ...prev].slice(0, 100));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [workspaceId, token, isPaused]);

  const togglePause = () => {
    if (isPaused) {
      setReports((prev) =>
        [...pendingReports.current.reverse(), ...prev].slice(0, 100),
      );
      pendingReports.current = [];
    }
    setIsPaused(!isPaused);
  };

  const clearLogs = () => setReports([]);
  const isEmpty = reports.length === 0;

  return (
    <div className="col-span-2 flex flex-col h-[500px] bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl relative overflow-hidden">
      <CRTOverlay />

      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                isConnected ? 'bg-emerald-500' : 'bg-red-500',
              )}
            ></div>
            {isConnected && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Terminal size={14} className="text-white" />
              Live Intercept Feed
            </h3>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {isConnected
                ? 'Encryption: TLS 1.3 // Stream: Active'
                : 'Connection Lost...'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <span className="text-[10px] text-zinc-500 font-mono mr-2">
              {reports.length} Events captured
            </span>
          )}

          <button
            onClick={togglePause}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-all',
              isPaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700',
            )}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? 'Resume' : 'Freeze'}
          </button>

          <button
            onClick={clearLogs}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Clear Buffer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950/50 z-10 relative',
          isEmpty ? 'flex flex-col justify-center items-center' : 'space-y-3',
        )}
      >
        {isPaused && !isEmpty && (
          <div className="sticky top-0 z-20 flex justify-center mb-4">
            <span className="bg-amber-500/90 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
              FEED PAUSED — BUFFERING EVENTS
            </span>
          </div>
        )}

        <AnimatePresence initial={false} mode="popLayout">
          {isEmpty ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <RadarScanner />
            </motion.div>
          ) : (
            reports.map((report) => <LogItem key={report.id} report={report} />)
          )}
        </AnimatePresence>

        {!isEmpty && <div className="h-4" />}
      </div>

      <div className="px-3 py-1.5 bg-black/80 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono flex justify-between z-10 shrink-0">
        <span>PVC_NODE_ID: {workspaceId.substring(0, 8)}...</span>
        <span>LATENCY: 12ms</span>
      </div>
    </div>
  );
}
