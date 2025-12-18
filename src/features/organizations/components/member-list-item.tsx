'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Trash2 } from 'lucide-react';
import { WorkspaceAccessPopover } from './workspace-access-popover';

interface Role {
  id: string;
  name: string;
  workspaceIds: string[];
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    contributions: { workspaceId: string }[];
  };
}

interface Workspace {
  id: string;
  name: string | null;
  slug: string;
}

interface MemberListItemProps {
  member: Member;
  currentUserId: string;
  roles: Role[];
  workspaces: Workspace[];
  onRoleChange: (userId: string, newRole: string) => void;
  onRemove: (userId: string) => void;
  onToggleAccess: (
    userId: string,
    workspaceId: string,
    hasAccess: boolean,
  ) => void;
}

export function MemberListItem({
  member,
  currentUserId,
  roles,
  workspaces,
  onRoleChange,
  onRemove,
  onToggleAccess,
}: MemberListItemProps) {
  // Helper: Get inherited workspaces for a specific role
  const getInheritedWorkspaceIds = (roleName: string): string[] => {
    if (roleName === 'owner') return workspaces.map((w) => w.id);
    const roleObj = roles.find((r) => r.name === roleName);
    return roleObj ? roleObj.workspaceIds : [];
  };

  const inheritedWorkspaceIds = getInheritedWorkspaceIds(member.role);

  return (
    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
      {/* User Info */}
      <div className="flex items-center gap-4 flex-1 w-full min-w-0">
        <Avatar
          className="h-10 w-10 border border-zinc-700 shadow-sm"
          withSantaHat
        >
          <AvatarImage src={member.user.image || undefined} />
          <AvatarFallback className="bg-zinc-800 text-zinc-300">
            {(member.user.name?.[0] || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-200 truncate">
              {member.user.name || 'Unknown'}
            </span>
            {member.role === 'owner' && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 h-5 border-amber-500/20 text-amber-500 bg-amber-500/10"
              >
                Owner
              </Badge>
            )}
            {member.role === 'moderator' && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 h-5 border-blue-500/20 text-blue-500 bg-blue-500/10"
              >
                Mod
              </Badge>
            )}
            {member.role !== 'owner' &&
              member.role !== 'moderator' &&
              member.role !== 'member' && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 h-5 border-zinc-700 text-zinc-400 bg-zinc-800"
                >
                  {member.role}
                </Badge>
              )}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {member.user.email}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden md:inline-block">
            Role:
          </span>
          <Select
            value={member.role}
            onValueChange={(val) => onRoleChange(member.user.id, val)}
            disabled={
              currentUserId === member.user.id || member.role === 'owner'
            }
          >
            <SelectTrigger className="w-[130px] h-9 bg-zinc-950/50 border-zinc-800 focus:ring-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              {/* Map Custom Roles */}
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <WorkspaceAccessPopover
          userId={member.user.id}
          memberRole={member.role}
          memberContributions={member.user.contributions}
          workspaces={workspaces}
          inheritedWorkspaceIds={inheritedWorkspaceIds}
          onToggleAccess={onToggleAccess}
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 h-9 w-9"
          onClick={() => onRemove(member.user.id)}
          disabled={currentUserId === member.user.id || member.role === 'owner'}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
