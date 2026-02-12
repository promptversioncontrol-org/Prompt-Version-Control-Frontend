'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Search, User as UserIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

import { inviteMemberAction } from '../actions/invite-member';
import {
  searchUsers,
  type SearchUserResult,
} from '@/features/users/actions/search-users';

interface InviteMemberDialogProps {
  organizationId: string;
}

export function InviteMemberDialog({
  organizationId,
}: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchUsers(email);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [email]);

  const addSearchUser = (user: SearchUserResult) => {
    if (!user.email) return;
    setEmail(user.email);
    setSearchResults([]);
    setSearchFocused(false);
  };

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setIsInviting(true);
    try {
      const result = await inviteMemberAction(organizationId, email, role);
      if (result.success) {
        toast.success('Invitation sent successfully');
        setEmail('');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5 border-none h-9">
          <Plus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite to Organization</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Search for a user or enter an email to invite them.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">User</label>
            <div className="relative group">
              <div className="relative">
                <Search
                  className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
                    searchFocused ? 'text-blue-400' : 'text-zinc-500',
                  )}
                />
                <Input
                  placeholder="Name or email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="pl-10 bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-white placeholder:text-zinc-600"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  </div>
                )}
              </div>

              {(searchResults.length > 0 ||
                (email.length >= 2 && !isSearching && searchFocused)) &&
                searchFocused && (
                  <div className="absolute z-50 w-full mt-2 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addSearchUser(user)}
                          className="w-full text-left px-3 py-2.5 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-3 group/item"
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
                            <div className="text-zinc-200 font-medium text-sm truncate">
                              {user.name || 'Unknown'}
                            </div>
                            <div className="text-zinc-500 text-xs truncate">
                              {user.email}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-zinc-500 text-xs">
                        No users found.
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Assign Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                {/* Future: Add custom roles here if needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={isInviting || !email}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isInviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
