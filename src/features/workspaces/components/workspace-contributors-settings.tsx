'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  Loader2,
  UserPlus,
  X,
  Search,
  User as UserIcon,
  Crown,
} from 'lucide-react';
import { inviteContributor } from '@/features/workspaces/actions/invite-contributor';
import { removeContributor } from '@/features/workspaces/actions/remove-contributor';
import { searchUsers } from '@/features/users/actions/search-users';
import type { SearchUserResult } from '@/features/users/contracts/user.dto';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

interface Contributor {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    email: string | null;
  };
  role: string;
  addedAt: Date;
}

interface WorkspaceContributorsSettingsProps {
  workspaceId: string;
  currentUserId: string;
  contributors: Contributor[];
  ownerId: string;
}

export function WorkspaceContributorsSettings({
  workspaceId,
  currentUserId,
  contributors,
  ownerId,
}: WorkspaceContributorsSettingsProps) {
  // Invite State
  const [inviteQuery, setInviteQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUserResult | null>(
    null,
  );
  const [isInviting, setIsInviting] = useState(false);

  // Search State
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Remove State
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inviteQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      // If we selected a user, don't search again until query changes significantly
      if (selectedUser && inviteQuery === selectedUser.username) return;

      setIsSearching(true);
      try {
        const results = await searchUsers(inviteQuery);
        // Filter out users already in contributors
        const currentIds = contributors.map((c) => c.user.id);
        setSearchResults(results.filter((u) => !currentIds.includes(u.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteQuery, contributors, selectedUser]);

  const selectUser = (user: SearchUserResult) => {
    setSelectedUser(user);
    setInviteQuery(user.username || '');
    setSearchResults([]);
    setSearchFocused(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernameToInvite = selectedUser?.username || inviteQuery;

    if (!usernameToInvite.trim()) return;

    setIsInviting(true);
    try {
      await inviteContributor(
        workspaceId,
        currentUserId,
        usernameToInvite,
        'member',
      );
      toast.success(`Invitation sent to ${usernameToInvite}`);
      setInviteQuery('');
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to send invitation. Check username.');
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this contributor?')) return;

    setIsRemoving(userId);
    try {
      await removeContributor(workspaceId, userId);
      toast.success('Contributor removed');
    } catch (error) {
      toast.error('Failed to remove contributor');
      console.error(error);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Invite Section */}
      <Card className="bg-zinc-950 border-zinc-800 overflow-visible">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <UserPlus className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-white">
                Invite Collaborators
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Search for users to add to this workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 overflow-visible">
          <form
            onSubmit={handleInvite}
            className="flex gap-3 items-start relative z-50"
          >
            <div className="flex-1 relative group">
              <div className="relative">
                <Search
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
                    searchFocused ? 'text-white' : 'text-zinc-500',
                  )}
                />
                <Input
                  id="username"
                  placeholder="Search by username..."
                  value={inviteQuery}
                  onChange={(e) => {
                    setInviteQuery(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-white focus:border-zinc-700 transition-all h-10"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Dropdown Results */}
              {searchResults.length > 0 && searchFocused && (
                <div className="absolute top-full left-0 w-full mt-2 p-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl ring-1 ring-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3 group/item"
                    >
                      {user.image ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-700">
                          <Image
                            src={user.image}
                            alt={user.name || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 ring-1 ring-zinc-700">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <div className="text-zinc-200 font-medium text-sm truncate group-hover/item:text-white transition-colors">
                          {user.name || 'Unknown'}
                        </div>
                        <div className="text-zinc-500 text-xs truncate">
                          @{user.username}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isInviting || !inviteQuery}
              className="bg-white text-black hover:bg-zinc-200 h-10 px-6 font-medium"
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Invite'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List Section */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              Team Members
              <Badge
                variant="secondary"
                className="bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-900"
              >
                {contributors.length}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-zinc-800/50">
            {contributors.map((contributor) => {
              const isOwner = contributor.user.id === ownerId;
              const isMe = contributor.user.id === currentUserId;

              return (
                <div
                  key={contributor.user.id}
                  className="flex items-center justify-between py-4 group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      className="h-10 w-10 border border-zinc-800 shadow-sm"
                      withSantaHat
                    >
                      <AvatarImage src={contributor.user.image || undefined} />
                      <AvatarFallback className="bg-zinc-900 text-zinc-400 font-medium">
                        {contributor.user.username?.slice(0, 2).toUpperCase() ||
                          'UN'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-zinc-200">
                          {contributor.user.name || contributor.user.username}
                        </span>
                        {isMe && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 h-5 border-zinc-700 text-zinc-500 bg-zinc-900/50"
                          >
                            You
                          </Badge>
                        )}
                        {isOwner && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 h-5 border-amber-500/20 text-amber-500 bg-amber-500/10 gap-1"
                          >
                            <Crown className="w-3 h-3" /> Owner
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        @{contributor.user.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isOwner && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-zinc-600 mr-2">
                          Member since{' '}
                          {new Date(contributor.addedAt).toLocaleDateString()}
                        </span>

                        {/* Role Badge (Non-interactive for now unless you add role changing) */}
                        <Badge
                          variant="outline"
                          className="bg-zinc-900 border-zinc-800 text-zinc-400 capitalize"
                        >
                          {contributor.role}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => handleRemove(contributor.user.id)}
                          disabled={isRemoving === contributor.user.id}
                        >
                          {isRemoving === contributor.user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    {isOwner && (
                      <span className="text-xs text-zinc-600 italic px-3">
                        Workspace Owner
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
