'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Shield, User } from 'lucide-react';

interface WorkspaceUser {
  role: string;
  addedAt: Date;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    email: string;
  };
}

interface WorkspaceUsersListProps {
  contributors: WorkspaceUser[];
  owner: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    email: string;
  };
  workspaceSlug: string;
}

export function WorkspaceUsersList({
  contributors,
  owner,
  workspaceSlug,
}: WorkspaceUsersListProps) {
  // Combine owner and contributors for display, ensuring owner is first
  const allUsers = [
    {
      role: 'owner',
      addedAt: new Date(), // Owner "joined" at creation, but we don't have workspace createdAt passed here easily without prop drill. Using current date or could be omitted/handled better.
      user: owner,
    },
    ...contributors,
  ];

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900 border-b border-zinc-800">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">User</TableHead>
            <TableHead className="text-zinc-400">Role</TableHead>
            <TableHead className="text-zinc-400">Joined</TableHead>
            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allUsers.map((item) => (
            <TableRow
              key={item.user.id}
              className="border-zinc-800 hover:bg-zinc-800/30 transition-colors"
            >
              <TableCell className="py-3">
                <Link
                  href={`/dashboard/workspaces/${workspaceSlug}/${item.user.username || item.user.id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar
                    className="h-9 w-9 border border-zinc-800"
                    withSantaHat
                  >
                    <AvatarImage src={item.user.image || undefined} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                      {item.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-zinc-200 font-medium group-hover:text-emerald-400 transition-colors">
                      {item.user.name}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      @{item.user.username || 'unknown'}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {item.role === 'owner' ? (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Owner
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-zinc-800 text-zinc-400 border-zinc-700"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Member
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm font-mono">
                {item.role === 'owner'
                  ? '-'
                  : new Date(item.addedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/dashboard/workspaces/${workspaceSlug}/${item.user.username || item.user.id}`}
                  className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline"
                >
                  View Files
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {allUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-500 py-8">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
