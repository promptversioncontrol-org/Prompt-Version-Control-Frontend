'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FileJson,
  Loader2,
  Upload,
  LayoutDashboard,
  MessageSquareText,
  ListFilter,
  CodeXml,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { getFileContent } from '../actions/get-file-content';
import { getWorkspaceLeaks } from '../actions/get-workspace-leaks';
import { NormalizedReport, ReportSession } from '../types/report-viewer.types';
import { analyzeSession } from '../services/report-viewer-logic';
import { DashboardStats } from './report-viewer/dashboard-stats';
import { SessionChat } from './report-viewer/session-chat';
import { SessionTimeline } from './report-viewer/session-timeline';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';

// Helper for cleaning up JSON
function normalizeReport(json: unknown): NormalizedReport | null {
  console.log('normalizeReport input:', json);
  if (!json || typeof json !== 'object') {
    console.error('normalizeReport: Invalid JSON object');
    return null;
  }

  const data = json as {
    data?: {
      updates?: unknown[];
      sessions?: unknown[];
      userId?: string;
      workspaceName?: string;
      date?: string;
    };
    updates?: unknown[];
    sessions?: unknown[];
    date?: string;
    meta?: { date?: string };
    ok?: boolean;
    userId?: string;
    workspaceName?: string;
  };

  const updates =
    (Array.isArray(data.data?.updates) ? data.data?.updates : null) ||
    (Array.isArray(data.updates) ? data.updates : null) ||
    (Array.isArray(data.data?.sessions) ? data.data?.sessions : null) ||
    (Array.isArray(data.sessions) ? data.sessions : null);

  const date =
    data.date || data.meta?.date || data.data?.date || new Date().toISOString();

  console.log('normalizeReport: extracted updates length:', updates?.length);

  if (updates) {
    // Deduplicate sessions by ID, keeping the one with the most events (fixes issue where initial empty session overwrites full session)
    const sessionMap = new Map<string, ReportSession>();

    updates.forEach((u: unknown) => {
      const sessionNode = u as { sessionId?: string; events?: unknown[] };
      const sid = sessionNode.sessionId || Math.random().toString();
      const existing = sessionMap.get(sid);
      const newLen = sessionNode.events?.length ?? 0;
      const oldLen = existing?.events?.length ?? 0;

      console.log(
        `[ReportViewer] Processing session ${sid.slice(0, 8)}... New items: ${newLen}, Existing items: ${oldLen}`,
      );

      // If it's new, or if the new one has more events, store it
      if (!existing || newLen > oldLen) {
        if (existing)
          console.log(
            `[ReportViewer] -> Replacing existing session with larger one.`,
          );
        sessionMap.set(sid, sessionNode as ReportSession);
      } else {
        console.log(
          `[ReportViewer] -> Keeping existing session (larger or equal).`,
        );
      }
    });

    const uniqueUpdates = Array.from(sessionMap.values());

    return {
      meta: {
        ok: data.ok ?? true,
        userId: data.userId || data.data?.userId || 'unknown',
        workspaceName:
          data.workspaceName || data.data?.workspaceName || 'unknown',
        date: date,
      },
      updates: uniqueUpdates,
      format: 'wrapped',
    };
  }
  console.error(
    'normalizeReport: Failed to extract updates. Keys found:',
    Object.keys(data),
  );
  return null;
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

import { SessionFindings } from './report-viewer/session-findings';
import { useRouter } from 'next/navigation'; // Add router
import { getUserFiles, type FileBrowserItem } from '../actions/get-user-files'; // ... (existing imports)

export default function ReportViewer({
  initialFileKey,
  workspaceSlug,
}: {
  initialFileKey?: string;
  workspaceSlug?: string;
  username?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sourceKey, setSourceKey] = useState(initialFileKey ?? '');
  const [rawJson, setRawJson] = useState<unknown | null>(null);
  const [findingsJson, setFindingsJson] = useState<unknown | null>(null);
  const [report, setReport] = useState<NormalizedReport | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siblingSessions, setSiblingSessions] = useState<FileBrowserItem[]>([]); // New state
  const router = useRouter();

  // Fetch sibling sessions (other folders in the same date directory)
  useEffect(() => {
    async function fetchSiblings() {
      if (!initialFileKey) return;

      // Key format: pvc/workspaces/{wid}/{uid}/{date}/{sessionId}/report.json
      const parts = initialFileKey.split('/');
      // Expecting at least 7 parts
      if (parts.length < 7 || parts[parts.length - 1] !== 'report.json') return;

      const workspaceId = parts[2];
      const userId = parts[3];
      const date = parts[4];

      // Prefix for listing sessions in that date: pvc/workspaces/{wid}/{uid}/{date}/
      // Note: getUserFiles appends prefix to root path (pvc/workspaces/{wid}/{uid}/)
      // So we just need to pass "{date}/" as prefix.
      const prefix = `${date}/`;

      try {
        const res = await getUserFiles({ workspaceId, userId, prefix });
        if (res.success && res.items) {
          // Filter for folders (these are the sessions)
          const folders = res.items.filter((item) => item.type === 'folder');
          // Sort by name (which acts as timestamp usually) or created date?
          // Folders might not have latModified in some S3 listings, but let's assume filtering is enough.
          // Reverse sort so newest is first implies default
          folders.sort((a, b) => b.name.localeCompare(a.name));
          setSiblingSessions(folders);
        }
      } catch (err) {
        console.error('Failed to fetch sibling sessions:', err);
      }
    }
    fetchSiblings();
  }, [initialFileKey]);

  const sessions = useMemo(() => report?.updates ?? [], [report]);
  const selectedSession = useMemo(() => {
    if (!sessions.length) return null;
    return (
      sessions.find((s) => s.sessionId === selectedSessionId) ?? sessions[0]
    );
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (!sessions.length) return;
    if (!selectedSessionId) setSelectedSessionId(sessions[0].sessionId);
  }, [selectedSessionId, sessions]);

  const analysis = useMemo(() => {
    if (!selectedSession) return null;
    return analyzeSession(selectedSession);
  }, [selectedSession]);

  const loadFromKey = useCallback(async (key: string) => {
    if (!key.trim()) {
      setError('Provide an S3 key or upload a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setFindingsJson(null);

    try {
      const reportKey = key.trim();

      // Fetch Report
      const result = await getFileContent(reportKey);
      if (!result.success || typeof result.content !== 'string') {
        throw new Error(result.error || 'Failed to fetch file from S3.');
      }
      const parsed = JSON.parse(result.content);
      setRawJson(parsed);
      const normalized = normalizeReport(parsed);
      setReport(normalized);
      const firstSessionId = normalized?.updates?.[0]?.sessionId;
      if (firstSessionId) setSelectedSessionId(firstSessionId);

      // Findings are now fetched via useEffect from DB
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setRawJson(null);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Findings from DB when session changes
  useEffect(() => {
    async function fetchFindings() {
      if (!selectedSessionId || !workspaceSlug) {
        setFindingsJson(null);
        return;
      }

      try {
        const res = await getWorkspaceLeaks({
          workspaceSlug,
          sessionId: selectedSessionId,
        });
        if (res.leaks) {
          // Map DB leaks to UI friendly format
          const mapped = res.leaks.map((l) => ({
            ...l,
            title: `Leak via ${l.source}${l.username ? ` (${l.username})` : ''}`,
            description: l.message,
            level: l.severity,
          }));
          setFindingsJson({ findings: mapped });
        }
      } catch (err) {
        console.error('Failed to fetch findings from DB:', err);
      }
    }
    fetchFindings();
  }, [selectedSessionId, workspaceSlug]);

  useEffect(() => {
    if (!initialFileKey) return;
    setSourceKey(initialFileKey);
    void loadFromKey(initialFileKey);
  }, [initialFileKey, loadFromKey]);

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-6 relative z-10 space-y-8">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white pl-0 gap-2 hover:bg-transparent"
            onClick={() => {
              // If workspaceSlug is available, go to dashboard
              if (workspaceSlug) {
                router.push(`/dashboard/workspaces/${workspaceSlug}`);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 shadow-xl">
                <FileJson className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Report Inspector
              </h1>
              {report && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5"
                >
                  {sessions.length} Sessions
                </Badge>
              )}
            </div>
            <p className="text-zinc-400 max-w-lg">
              Analyze interaction logs, token usage, and AI reasoning chains
              from your PVC workspace history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const text = String(reader.result ?? '');
                    const parsed = JSON.parse(text);
                    setRawJson(parsed);
                    const normalized = normalizeReport(parsed);
                    setReport(normalized);
                    const firstSessionId = normalized?.updates?.[0]?.sessionId;
                    if (firstSessionId) setSelectedSessionId(firstSessionId);
                    setError(null);
                  } catch {
                    setError('Invalid JSON file.');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </div>
        </div>

        {/* Controls / Inputs */}
        {!report && (
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-300">
                Load Remote Report
              </CardTitle>
              <CardDescription>
                Enter the S3 object key to fetch the report securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={sourceKey}
                onChange={(e) => setSourceKey(e.target.value)}
                placeholder="pvc/workspaces/..."
                className="bg-zinc-950 border-zinc-800 font-mono text-zinc-300"
              />
              <Button
                onClick={() => void loadFromKey(sourceKey)}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  'Load'
                )}
              </Button>
            </CardContent>
            {error && (
              <div className="mx-6 mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </Card>
        )}

        {/* Main Content */}
        {report && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Session Selector */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-400">
                  Active Session:
                </span>
                <Select
                  value={selectedSessionId}
                  onValueChange={(val) => {
                    // Check if this value is in siblingSessions
                    const isSibling = siblingSessions.find(
                      (s) => s.name === val,
                    );
                    if (isSibling && initialFileKey) {
                      // Construct new key
                      // Old: .../{date}/{oldSessionId}/report.json
                      // New: .../{date}/{val}/report.json
                      const parts = initialFileKey.split('/');
                      if (parts.length >= 7) {
                        parts[5] = val; // Replace session ID
                        const newKey = parts.join('/');
                        // Navigate to new key
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.set('key', newKey);
                        router.push(newUrl.pathname + newUrl.search);
                        return;
                      }
                    }
                    // Fallback for internal switching (legacy)
                    setSelectedSessionId(val);
                  }}
                >
                  <SelectTrigger className="w-[320px] bg-zinc-950/80 border-zinc-800 text-zinc-200 font-mono h-9">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {/* If we have sibling sessions from S3, show them */}
                    {siblingSessions.length > 0
                      ? siblingSessions.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.name}
                            className="font-mono text-xs text-zinc-300 focus:bg-zinc-800 focus:text-white data-[state=checked]:text-emerald-400 data-[state=checked]:bg-emerald-500/10 cursor-pointer"
                          >
                            {truncate(s.name, 48)}
                          </SelectItem>
                        ))
                      : // Fallback to internal sessions from report.json (legacy/single file mode)
                        sessions.map((s, idx) => (
                          <SelectItem
                            key={`${s.sessionId}-${idx}`}
                            value={s.sessionId}
                            className="font-mono text-xs text-zinc-300 focus:bg-zinc-800 focus:text-white data-[state=checked]:text-emerald-400 data-[state=checked]:bg-emerald-500/10 cursor-pointer"
                          >
                            {truncate(s.sessionId, 48)}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                {selectedSession?.generatedAt
                  ? new Date(selectedSession.generatedAt).toLocaleString()
                  : ''}
              </div>
            </div>

            {/* Tabs / Views */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <div className="flex items-center justify-center">
                <TabsList className="bg-zinc-900/60 border border-zinc-800 p-1 rounded-full">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 hover:text-zinc-200 rounded-full px-6 transition-all duration-300"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 hover:text-zinc-200 rounded-full px-6 transition-all duration-300"
                  >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 hover:text-zinc-200 rounded-full px-6 transition-all duration-300"
                  >
                    <ListFilter className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="findings"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 hover:text-zinc-200 rounded-full px-6 transition-all duration-300"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Findings
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 hover:text-zinc-200 rounded-full px-6 transition-all duration-300"
                  >
                    <CodeXml className="h-4 w-4 mr-2" />
                    Raw Data
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="dashboard"
                className="outline-none focus:outline-none"
              >
                <DashboardStats
                  analysis={analysis}
                  eventsCount={selectedSession?.events.length ?? 0}
                />
              </TabsContent>

              <TabsContent
                value="chat"
                className="outline-none focus:outline-none min-h-[500px]"
              >
                {analysis && (
                  <SessionChat conversation={analysis.conversation} />
                )}
              </TabsContent>

              <TabsContent
                value="timeline"
                className="outline-none focus:outline-none min-h-[500px]"
              >
                {analysis && <SessionTimeline items={analysis.timeline} />}
              </TabsContent>

              <TabsContent
                value="findings"
                className="outline-none focus:outline-none min-h-[500px]"
              >
                <SessionFindings findings={findingsJson} />
              </TabsContent>

              <TabsContent value="raw">
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-0">
                    <pre className="p-4 overflow-auto max-h-[600px] text-xs font-mono text-zinc-400 bg-[#0d1117] rounded-lg">
                      {JSON.stringify(rawJson, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
