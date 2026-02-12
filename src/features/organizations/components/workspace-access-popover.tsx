'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Layout, ChevronDown, Lock } from 'lucide-react';

interface Workspace {
  id: string;
  name: string | null;
  slug: string;
}

interface WorkspaceAccessPopoverProps {
  memberRole: string;
  memberContributions: { workspaceId: string }[];
  workspaces: Workspace[];
  inheritedWorkspaceIds: string[];
  userId: string;
  onToggleAccess: (
    userId: string,
    workspaceId: string,
    hasAccess: boolean,
  ) => void;
}

export function WorkspaceAccessPopover({
  memberRole,
  memberContributions,
  workspaces,
  inheritedWorkspaceIds,
  userId,
  onToggleAccess,
}: WorkspaceAccessPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full md:w-auto border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-9"
        >
          <Layout className="w-4 h-4 mr-2" />
          Access
          <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0 bg-transparent border-none shadow-none"
        align="end"
        side="bottom"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400">
              Workspace Access
            </span>
            {memberRole === 'owner' && (
              <span className="text-[10px] text-amber-500">
                Full Access (Owner)
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 bg-zinc-950/30">
            {workspaces.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                No workspaces available
              </div>
            ) : (
              workspaces.map((ws) => {
                // Logic: Is inherited?
                const isInherited = inheritedWorkspaceIds.includes(ws.id);
                // Logic: Is explicitly granted?
                const isExplicitlyGranted = memberContributions.some(
                  (c) => c.workspaceId === ws.id,
                );

                return (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">
                        {ws.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        /{ws.slug}
                      </span>
                    </div>

                    {isInherited ? (
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-400 border border-zinc-700 h-6 gap-1 hover:bg-zinc-800"
                      >
                        <Lock className="w-3 h-3" />
                        Inherited
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isExplicitlyGranted}
                          onCheckedChange={(checked) =>
                            onToggleAccess(userId, ws.id, checked)
                          }
                          className="data-[state=checked]:bg-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {inheritedWorkspaceIds.length > 0 &&
            inheritedWorkspaceIds.length < workspaces.length && (
              <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
                Access inherited from{' '}
                <span className="text-zinc-300">{memberRole}</span> role cannot
                be removed here.
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
