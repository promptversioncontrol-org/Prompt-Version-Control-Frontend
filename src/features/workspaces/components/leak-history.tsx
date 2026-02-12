'use client';

import React, { useState, useEffect } from 'react';
import { getWorkspaceLeaks } from '../actions/get-workspace-leaks';
import { getLeakUsers } from '../actions/get-leak-users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  ShieldAlert,
  Activity,
  Search,
  User,
  RefreshCcw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LeakHistoryProps {
  workspaceSlug: string;
}

export function LeakHistory({ workspaceSlug }: LeakHistoryProps) {
  const [leaks, setLeaks] = useState<
    Awaited<ReturnType<typeof getWorkspaceLeaks>>['leaks']
  >([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    getLeakUsers(workspaceSlug).then(setUsers).catch(console.error);
  }, [workspaceSlug]);

  const fetchLeaks = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWorkspaceLeaks({
        workspaceSlug,
        severity: severity === 'all' ? undefined : severity,
        username: selectedUser === 'all' ? undefined : selectedUser,
        search: search.length > 2 ? search : undefined,
      });
      setLeaks(result.leaks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, severity, selectedUser, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaks();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLeaks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search source, user, logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 focus:ring-emerald-500/20"
            />
          </div>

          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[160px] bg-zinc-950 border-zinc-800 text-zinc-100">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800 text-zinc-100">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeaks}
          className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          <RefreshCcw className="h-3.5 w-3.5 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/40 relative h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-zinc-900 shadow-sm border-b border-zinc-800">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[180px] text-zinc-400 font-medium">
                Timestamp
              </TableHead>
              <TableHead className="text-zinc-400 font-medium">
                Severity
              </TableHead>
              <TableHead className="text-zinc-400 font-medium">
                User / Source
              </TableHead>
              <TableHead className="text-zinc-400 font-medium">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <RefreshCcw className="h-4 w-4 animate-spin" /> Loading
                    logs...
                  </div>
                </TableCell>
              </TableRow>
            ) : leaks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-zinc-500"
                >
                  No leaks found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              leaks.map((leak) => (
                <TableRow
                  key={leak.id}
                  className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group"
                >
                  <TableCell className="font-mono text-xs text-zinc-400 align-top py-3">
                    <div className="flex flex-col gap-0.5">
                      <span>
                        {new Date(leak.detectedAt).toLocaleDateString()}
                      </span>
                      <span className="text-zinc-500">
                        {new Date(leak.detectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize border-opacity-40',
                        leak.severity === 'high'
                          ? 'text-red-400 border-red-500 bg-red-500/10'
                          : leak.severity === 'medium'
                            ? 'text-amber-400 border-amber-500 bg-amber-500/10'
                            : 'text-zinc-400 border-zinc-500 bg-zinc-500/10',
                      )}
                    >
                      {leak.severity === 'high' && (
                        <ShieldAlert className="h-3 w-3 mr-1" />
                      )}
                      {leak.severity === 'medium' && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {leak.severity === 'low' && (
                        <Activity className="h-3 w-3 mr-1" />
                      )}
                      {leak.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-medium text-sm">
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        {leak.username || 'Unknown'}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                        via {leak.source}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-zinc-300 font-medium">
                        {leak.message}
                      </span>
                      {leak.snippet && (
                        <div className="bg-black/50 border border-zinc-800 rounded px-2 py-1.5 font-mono text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors w-fit max-w-md break-all">
                          {leak.snippet}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
