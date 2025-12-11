'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Upload,
  FileJson,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Terminal,
  Cpu,
  MessageSquare,
  BrainCircuit,
  Search,
  FolderKanban,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { getFileContent } from '../actions/get-file-content';
import {
  ReportFinding,
  SessionEvent,
  ReportSession,
  ReportDataContent,
  SessionEventPayload,
} from '../types/report.types';

interface ReportViewerProps {
  initialFileKey?: string;
  workspaceSlug?: string;
  username?: string;
}

export default function ReportViewer({
  initialFileKey,
  workspaceSlug,
  username,
}: ReportViewerProps) {
  const [reportData, setReportData] = useState<ReportDataContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  // Load initial file if key is provided
  useEffect(() => {
    if (initialFileKey) {
      const loadInitialFile = async () => {
        setLoading(true);
        try {
          const result = await getFileContent(initialFileKey);
          if (result.success && result.content) {
            const parsed = JSON.parse(result.content);
            // Handle both wrapped and unwrapped structure just in case, but prefer root.data
            if (parsed.data && parsed.data.updates) {
              setReportData(parsed.data);
            } else if (parsed.updates) {
              setReportData(parsed);
            } else {
              setError('Invalid report format: missing updates');
            }
          } else {
            setError('Failed to load report file');
          }
        } catch (err) {
          console.error(err);
          setError('Invalid report file');
        } finally {
          setLoading(false);
        }
      };
      loadInitialFile();
    }
  }, [initialFileKey]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.data && json.data.updates) {
          setReportData(json.data);
        } else if (json.updates) {
          setReportData(json);
        } else {
          setError('Invalid report format');
        }
      } catch {
        setError('Invalid JSON file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Process data for charts & KPIs
  const stats = useMemo(() => {
    if (!reportData || !reportData.updates) return null;
    const sessions = reportData.updates;

    let totalFindings = 0;
    let findingsHigh = 0;
    let totalTokens = 0;
    let maxRisk = 0;

    const sessionStats = sessions.map((s) => {
      let sFindings = 0;
      let sRisk = 0;
      let sTokens = 0;

      s.events.forEach((e) => {
        if (e.findings) {
          totalFindings += e.findings.length;
          sFindings += e.findings.length;
          e.findings.forEach((f) => {
            if (f.severity === 'high' || f.severity === 'critical')
              findingsHigh++;
          });
          // Dummy risk scoring
          if (e.findings.length > 0) sRisk += e.findings.length * 10;
        }

        if (e.type === 'token_count') {
          sTokens += e.payload.info?.total_token_usage?.total_tokens || 0;
        } else if (
          e.type === 'response_item' &&
          e.payload?.type === 'token_count'
        ) {
          // Handle nested token count if exists in response_item
        }
      });

      totalTokens += sTokens;
      if (sRisk > maxRisk) maxRisk = sRisk;

      return {
        id: s.sessionId,
        risk: sRisk,
        findings: sFindings,
        tokens: sTokens,
        timestamp: s.generatedAt || s.events[0]?.timestamp,
        eventCount: s.events.length,
      };
    });

    return {
      totalSessions: sessions.length,
      totalFindings,
      findingsHigh,
      totalTokens,
      maxRisk,
      sessionStats,
      lastGenerated: sessions[0]?.generatedAt,
    };
  }, [reportData]);

  const selectedSession = useMemo(() => {
    if (!reportData || !selectedSessionId) return null;
    return reportData.updates.find((s) => s.sessionId === selectedSessionId);
  }, [reportData, selectedSessionId]);

  // Auto-select first session when data loads
  useEffect(() => {
    if (
      reportData?.updates &&
      reportData.updates.length > 0 &&
      !selectedSessionId
    ) {
      setSelectedSessionId(reportData.updates[0].sessionId);
    }
  }, [reportData, selectedSessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p>Loading report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="bg-[#09090b] text-white flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center p-8">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <FileJson className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">
            Security Report Analyzer
          </h1>
          <p className="text-zinc-400 mb-8">
            Upload your <code>report.json</code> file to visualize agent
            interactions, risk findings, and token usage.
          </p>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-lg font-medium transition-colors">
            <Upload className="w-4 h-4" />
            Select JSON File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] text-zinc-100 p-6 flex flex-col gap-6 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb - Only show if context is available */}
        {workspaceSlug && username && initialFileKey && (
          <div className="inline-flex items-center bg-zinc-950/50 border border-zinc-800 rounded-md px-3 py-1.5 font-mono text-sm text-zinc-400 w-fit">
            <Link
              href={`/dashboard/workspaces/${workspaceSlug}`}
              className="flex items-center hover:text-white transition-colors"
            >
              <div className="mr-2 text-emerald-500">~/</div>
              <FolderKanban className="w-4 h-4 mr-2" />
              {workspaceSlug}
            </Link>

            <span className="mx-2 text-zinc-600">&gt;</span>

            <Link
              href={`/dashboard/workspaces/${workspaceSlug}/${username}`}
              className="flex items-center hover:text-white transition-colors"
            >
              @{username}
            </Link>

            <span className="mx-2 text-zinc-600">&gt;</span>

            <div className="flex items-center text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
              {initialFileKey.split('/').slice(-2).join('/')}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-emerald-500" />
            Audit Report Dashboard
          </h1>
          <p className="text-zinc-400 text-sm font-mono mt-1">
            Generated:{' '}
            {stats?.lastGenerated
              ? format(new Date(stats.lastGenerated), 'PPpp')
              : '-'}
          </p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm transition-colors">
            <Upload className="w-4 h-4" />
            Load New File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sessions"
          value={stats?.totalSessions || 0}
          icon={<Terminal className="text-blue-500" />}
        />
        <StatsCard
          title="Max Risk Score"
          value={stats?.maxRisk || 0}
          icon={
            <Activity
              className={cn(
                'text-zinc-500',
                (stats?.maxRisk ?? 0) > 0 && 'text-red-500',
              )}
            />
          }
          className={
            (stats?.maxRisk ?? 0) > 0 ? 'border-red-500/30 bg-red-500/5' : ''
          }
        />
        <StatsCard
          title="Security Findings"
          value={stats?.totalFindings || 0}
          subValue={`${stats?.findingsHigh} Critical`}
          icon={<AlertTriangle className="text-amber-500" />}
        />
        <StatsCard
          title="Total Tokens Used"
          value={(stats?.totalTokens || 0).toLocaleString()}
          icon={<Cpu className="text-purple-500" />}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              Risk Gradient Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.sessionStats}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                    }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              Token Usage per Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.sessionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="id" hide />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <RechartsTooltip
                    cursor={{ fill: '#27272a' }}
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                    }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Session List */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-100">Sessions</CardTitle>
              <div className="relative w-32">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  placeholder="Filter..."
                  className="h-8 pl-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {stats?.sessionStats.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-md text-sm transition-colors border border-transparent',
                    selectedSessionId === s.id
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'hover:bg-zinc-800/50 text-zinc-400',
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs opacity-70">
                      {s.id.substring(0, 8)}...
                    </span>
                    {s.risk > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 border-red-900/50 text-red-500 bg-red-900/10"
                      >
                        RISK: {s.risk}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs opacity-50">
                    <span>{s.findings} Findings</span>
                    <span>{format(new Date(s.timestamp), 'HH:mm')}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Detailed Session View */}
        <Card className="bg-zinc-900 border-zinc-800 col-span-2 flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-mono text-sm text-zinc-300">
                    Session: {selectedSession.sessionId}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  >
                    {selectedSession.events.length} Events
                  </Badge>
                </div>
              </div>

              <Tabs
                defaultValue="chat"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <TabsList className="w-full justify-start rounded-none border-b border-zinc-800 bg-transparent px-4 h-11">
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 text-zinc-400 rounded-none h-11"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat Flow
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 text-zinc-400 rounded-none h-11"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Context & Meta
                  </TabsTrigger>
                  <TabsTrigger
                    value="findings"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-400 text-zinc-400 rounded-none h-11"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Findings{' '}
                    <span className="ml-2 bg-red-500/20 text-red-400 px-1.5 rounded-full text-xs">
                      {selectedSession.events.reduce(
                        (acc, e) => acc + (e.findings?.length || 0),
                        0,
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-zinc-500 data-[state=active]:text-zinc-300 text-zinc-400 rounded-none h-11"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Raw Events
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="chat" className="h-full m-0 p-0">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-6">
                        <SessionTimeline events={selectedSession.events} />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="metadata" className="h-full m-0 p-0">
                    <ScrollArea className="h-full p-6">
                      <SessionMetadataView
                        events={selectedSession.events}
                        session={selectedSession}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="findings" className="h-full m-0 p-0">
                    <ScrollArea className="h-full p-6">
                      {selectedSession.events.filter(
                        (e) => e.findings && e.findings.length > 0,
                      ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                          <ShieldAlert className="w-8 h-8 opacity-20 mb-2" />
                          <p>No security findings in this session.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedSession.events
                            .filter((e) => e.findings && e.findings.length > 0)
                            .map((e, idx) => (
                              <div key={idx} className="space-y-3">
                                {e.findings!.map((finding, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="bg-red-500/5 border border-red-500/20 rounded-lg p-4"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="text-red-400 font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        {finding.message}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className="border-red-800 text-red-500 uppercase"
                                      >
                                        {finding.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-3">
                                      Rule ID:{' '}
                                      <span className="font-mono text-zinc-300">
                                        {finding.ruleId}
                                      </span>
                                    </p>
                                    {finding.snippet && (
                                      <div className="bg-black/50 p-3 rounded border border-red-900/20 font-mono text-xs text-red-200/80 break-all">
                                        {finding.snippet}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="raw" className="h-full m-0 p-0">
                    <ScrollArea className="h-full p-4">
                      <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap">
                        {JSON.stringify(selectedSession.events, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Select a session to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// --- Subcomponents ---

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  className?: string;
}

function StatsCard({
  title,
  value,
  subValue,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('bg-zinc-900 border-zinc-800', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{value}</span>
              {subValue && (
                <span className="text-xs text-zinc-500">{subValue}</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-zinc-950 rounded-full border border-zinc-800">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionMetadataView({
  events,
  session,
}: {
  events: SessionEvent[];
  session: ReportSession;
}) {
  const metaEvent = events.find((e) => e.type === 'session_meta');
  const turnContext = events.find((e) => e.type === 'turn_context');
  const ghostSnapshot = events.find(
    (e) => e.type === 'response_item' && e.payload?.type === 'ghost_snapshot',
  );
  const tokenEvent = events.find(
    (e) => e.type === 'event_msg' && e.payload?.type === 'token_count',
  );

  const meta = metaEvent?.payload;
  const context = turnContext?.payload;
  const git = ghostSnapshot?.payload?.ghost_commit;
  const ratelimits = tokenEvent?.payload?.rate_limits;

  return (
    <div className="space-y-8">
      {/* Environment */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" /> Environment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Model:</span>{' '}
              <span className="text-zinc-200 font-mono">
                {context?.model || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Provider:</span>{' '}
              <span className="text-zinc-200">
                {meta?.model_provider || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Source:</span>{' '}
              <span className="text-zinc-200">{meta?.source || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">CLI Ver:</span>{' '}
              <span className="text-zinc-200 font-mono">
                {meta?.cli_version || 'N/A'}
              </span>
            </div>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Sandbox:</span>{' '}
              <span className="text-zinc-200">
                {context?.sandbox_policy?.type || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Effort:</span>{' '}
              <span className="text-zinc-200">{context?.effort || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Approval:</span>{' '}
              <span className="text-zinc-200">
                {context?.approval_policy || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Git / Version Control */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-orange-400" /> Version Control
          (Ghost Commit)
        </h3>
        {git ? (
          <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 text-sm space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 w-20">Commit:</span>
                <code className="text-orange-300 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-900/50">
                  {git.id}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 w-20">Parent:</span>
                <code className="text-zinc-400 text-xs">{git.parent}</code>
              </div>
            </div>

            {git.preexisting_untracked_files && (
              <div className="space-y-1">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">
                  Untracked Files
                </span>
                <div className="flex flex-wrap gap-1">
                  {git.preexisting_untracked_files.map(
                    (file: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-zinc-800 text-zinc-400 font-mono text-xs"
                      >
                        {file}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-zinc-500 italic text-sm">
            No version control snapshot available.
          </div>
        )}
      </div>

      {/* Rate Limits / Usage */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" /> Usage & Limits
        </h3>
        {ratelimits ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 text-sm">
              <div className="text-zinc-500 mb-1">Primary Window</div>
              <div className="text-2xl font-bold text-white">
                {ratelimits.primary?.used_percent}%
              </div>
              <div className="text-xs text-zinc-600">
                Resets:{' '}
                {new Date(
                  ratelimits.primary?.resets_at * 1000,
                ).toLocaleTimeString()}
              </div>
            </div>
            <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 text-sm">
              <div className="text-zinc-500 mb-1">Credits Balance</div>
              <div className="text-2xl font-bold text-white">
                {ratelimits.credits?.balance}
              </div>
              <div className="text-xs text-zinc-600">
                Has Credits: {ratelimits.credits?.has_credits ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 italic text-sm">
            No usage data available.
          </div>
        )}
      </div>

      <div className="space-y-1 pt-4 border-t border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 uppercase">
          Working Directory
        </h3>
        <code className="block bg-black/40 p-2 rounded text-xs text-zinc-400 font-mono break-all border border-zinc-800/50">
          {session.cwd ||
            JSON.stringify(
              session.events.find((e) => e.payload?.cwd)?.payload?.cwd,
            )}
        </code>
      </div>
    </div>
  );
}

// --- Advanced Timeline Visualizer ---
function SessionTimeline({ events }: { events: SessionEvent[] }) {
  // Sort events just in case, though they usually come sorted
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <>
      {sortedEvents.map((event, index) => {
        const type =
          event.type === 'event_msg' ? event.payload.type : event.type;

        // 1. User Message
        if (
          type === 'user_message' ||
          (event.type === 'response_item' && event.payload?.role === 'user')
        ) {
          const content =
            event.payload.message || event.payload.content?.[0]?.text;
          if (!content) return null;

          return (
            <div key={index} className="flex justify-end pl-12">
              <div className="bg-blue-600/10 border border-blue-600/20 text-blue-100 rounded-lg rounded-tr-none p-4 max-w-full">
                <div className="text-xs text-blue-400/50 mb-1 font-mono uppercase">
                  User Input
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {content}
                </div>
              </div>
            </div>
          );
        }

        // 2. Agent Reasoning (Thinking)
        if (
          type === 'agent_reasoning' ||
          (event.type === 'response_item' &&
            event.payload?.type === 'reasoning')
        ) {
          const text = event.payload.text || event.payload.summary?.[0]?.text;
          if (!text) return null;

          return (
            <div key={index} className="flex gap-3 pr-12">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                </div>
                <div className="w-px h-full bg-zinc-800 my-2"></div>
              </div>
              <div className="py-2">
                <div className="text-zinc-400 text-sm italic border-l-2 border-purple-500/30 pl-4 py-1">
                  <span className="text-purple-400 text-xs font-bold uppercase not-italic block mb-1">
                    Reasoning
                  </span>
                  {text}
                </div>
              </div>
            </div>
          );
        }

        // 3. Assistant Message (Final Response)
        if (
          type === 'agent_message' ||
          (event.type === 'response_item' &&
            event.payload?.role === 'assistant')
        ) {
          const content =
            event.payload.message || event.payload.content?.[0]?.text;
          if (!content) return null;

          return (
            <div key={index} className="flex gap-3 pr-12">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Terminal className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-zinc-800/40 border border-zinc-800 rounded-lg rounded-tl-none p-4 w-full">
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase flex justify-between">
                  <span>Assistant</span>
                  <span>{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
                </div>
                <div className="whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">
                  {content}
                </div>
              </div>
            </div>
          );
        }

        // 4. Token Usage Stats (Small Info)
        if (type === 'token_count') {
          const info = event.payload.info?.total_token_usage;
          if (!info) return null;
          return (
            <div key={index} className="flex justify-center my-4">
              <Badge
                variant="outline"
                className="text-xs font-mono text-zinc-600 border-zinc-800 bg-zinc-950/50"
              >
                Tokens: {info.total_tokens} (In: {info.input_tokens} / Out:{' '}
                {info.output_tokens})
              </Badge>
            </div>
          );
        }

        // 5. Findings (Inline Alerts)
        if (event.findings && event.findings.length > 0) {
          return (
            <div
              key={index}
              className="my-2 border border-red-500/40 bg-red-500/5 rounded p-3 mx-8"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                Risk Finding Detected
              </div>
              <div className="text-xs text-red-300/80">
                {event.findings[0].message}
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
