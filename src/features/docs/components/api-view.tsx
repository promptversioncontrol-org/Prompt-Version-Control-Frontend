'use client';

import { Construction } from 'lucide-react';

export function ApiView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="relative p-4 bg-black/50 border border-white/10 rounded-full backdrop-blur-sm">
          <Construction className="w-12 h-12 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
          API Reference
        </h1>
        <p className="text-xl text-zinc-400">Coming Soon</p>
      </div>

      <p className="max-w-md text-zinc-500">
        We are currently documenting our public API. Check back later for
        details on how to integrate PVC directly into your applications.
      </p>
    </div>
  );
}
