'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';

const STEPS = [
  {
    cmd: 'pvc login --ssh',
    output: 'Authenticating via SSH... Success! Logged in as user@pvc.dev',
  },
  {
    cmd: 'pvc init',
    output: 'Initialized empty PVC repository in ./.pvc',
  },
  {
    cmd: 'pvc remote add origin https://git.pvc.dev/project.git',
    output: 'Remote "origin" added successfully.',
  },
  {
    cmd: 'pvc update-conv',
    output: 'Synced latest Codex session: 550e8400-e29b...',
  },
  {
    cmd: 'pvc watch',
    output: 'Daemon started. Monitoring prompts for sensitive data...',
  },
  {
    cmd: 'pvc push',
    output: 'Compressing logs... Uploaded daily reports to remote.',
  },
];

export function TerminalHero() {
  const [stepIndex, setStepIndex] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length + 1) return 1;
        return prev + 1;
      });
    }, 1500); // 1.5s interval (faster)
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-black border-zinc-800 shadow-2xl overflow-hidden font-mono text-sm relative group text-left">
      {/* Window Controls */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
        <div className="ml-2 text-xs text-zinc-500">user@pvc:~/project</div>
      </div>

      {/* Terminal Body - Top Aligned */}
      <div className="p-6 space-y-4 h-[240px] flex flex-col justify-start">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`transition-all duration-500 ${i < stepIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}
          >
            <div className="flex gap-2 text-zinc-50">
              <span className="text-emerald-500 font-bold">➜</span>
              <span className="text-blue-400 font-bold">~</span>
              <span className="text-zinc-300">{step.cmd}</span>
            </div>
            <div className="text-zinc-400 pl-4 mt-1">{step.output}</div>
          </div>
        ))}

        {/* Cursor Line */}
        <div
          className={`flex gap-2 ${stepIndex >= STEPS.length ? 'opacity-100' : 'opacity-0 hidden'}`}
        >
          <span className="text-emerald-500">➜</span>
          <span className="text-blue-400">~</span>
          <span className="animate-pulse bg-zinc-500 w-2.5 h-5 block"></span>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none" />
    </Card>
  );
}
