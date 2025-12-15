'use client';

import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  FileCode2,
  Terminal,
  Clock,
  Zap,
  Coins,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { SessionAnalysis } from '../../types/report-viewer.types';

interface DashboardStatsProps {
  analysis: SessionAnalysis | null;
  eventsCount: number;
}

export function DashboardStats({ analysis, eventsCount }: DashboardStatsProps) {
  const tokenChartData = useMemo(() => {
    if (!analysis) return [];
    return analysis.tokenPoints.map((p, idx) => ({
      key: idx,
      tsMs: p.tsMs,
      time: p.tsMs
        ? new Date(p.tsMs).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '-',
      total: p.total.total_tokens ?? 0,
      input: p.total.input_tokens ?? 0,
      cached: p.total.cached_input_tokens ?? 0,
      output: p.total.output_tokens ?? 0,
      reasoning: p.total.reasoning_output_tokens ?? 0,
    }));
  }, [analysis]);

  const stats = [
    {
      label: 'Events',
      value: eventsCount,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Total Tokens',
      value: analysis?.lastTokenTotal?.total_tokens?.toLocaleString() ?? '—',
      icon: Coins,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: 'Tool Calls',
      value: analysis?.toolCalls.length ?? 0,
      icon: Terminal,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'File Changes',
      value: analysis?.fileEdits.length ?? 0,
      icon: FileCode2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`bg-zinc-900/40 backdrop-blur-sm border ${stat.border} hover:border-opacity-50 transition-colors`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-zinc-100 font-mono">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-sm border-zinc-800/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Token Usage Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={tokenChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorOutput"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorCached"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="input"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="url(#colorInput)"
                    name="Input Tokens"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cached"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="url(#colorCached)"
                    name="Cached Tokens"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="output"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorOutput)"
                    name="Output Tokens"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Side Info */}
        <div className="space-y-4">
          {/* Model Info */}
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-500" />
                AI Models Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.models.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between"
                  >
                    <Badge
                      variant="outline"
                      className="font-mono bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                    >
                      {m.name}
                    </Badge>
                    <span className="text-sm text-zinc-500 font-mono">
                      {m.count} turns
                    </span>
                  </div>
                ))}
                {analysis.models.length === 0 && (
                  <span className="text-sm text-zinc-500">
                    No model data found
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Context Info */}
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/60 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                Latest Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.turnContexts.length > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Approval Policy</span>
                    <span className="text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                      {analysis.turnContexts.at(-1)?.approvalPolicy ?? '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Sandbox</span>
                    <span className="text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                      {analysis.turnContexts.at(-1)?.sandboxPolicy ?? '—'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-zinc-500">
                  No context available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
