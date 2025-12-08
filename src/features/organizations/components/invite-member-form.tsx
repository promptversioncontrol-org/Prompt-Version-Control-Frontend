'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { inviteMemberAction } from '../actions/invite-member';
import { Loader2 } from 'lucide-react';

export function InviteMemberForm({
  organizationId,
  slug,
  userId,
}: {
  organizationId: string;
  slug: string;
  userId: string;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState('');

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage('');
    try {
      await inviteMemberAction(organizationId, email, role, userId, slug);
      setMessage('Invitation sent!');
      setEmail('');
    } catch (err) {
      setMessage('Failed to send invitation.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onInvite} className="flex gap-4 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email Address
        </label>
        <Input
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
        />
      </div>
      <div className="w-[140px] space-y-2">
        <label className="text-sm font-medium leading-none">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Invite
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground ml-2">{message}</p>
      )}
    </form>
  );
}
