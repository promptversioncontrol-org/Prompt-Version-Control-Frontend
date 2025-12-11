'use client';

import { useState } from 'react';
import {
  updateOrganizationRoleAction,
  removeOrganizationMemberAction,
} from '../actions/manage-members';
import { toggleWorkspaceAccessAction } from '../actions/manage-workspace-access';
import { toast } from 'sonner';

import { InviteMemberDialog } from './invite-member-dialog';
import { MemberListItem } from './member-list-item';

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

interface OrganizationMembersSettingsProps {
  organizationId: string;
  members: Member[];
  roles: Role[];
  workspaces: Workspace[];
  currentUserId: string;
}

export function OrganizationMembersSettings({
  organizationId,
  members,
  roles,
  workspaces,
  currentUserId,
}: OrganizationMembersSettingsProps) {
  const [memberList, setMemberList] = useState(members);

  // --- Role Management ---
  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic update
    setMemberList((prev) =>
      prev.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m)),
    );

    const result = await updateOrganizationRoleAction(
      organizationId,
      userId,
      newRole,
    );

    if (result.success) {
      toast.success('Role updated successfully');
    } else {
      toast.error(result.error || 'Failed to update role');
      // Revert on failure
      setMemberList(members);
    }
  };

  // --- Member Removal ---
  const handleRemoveMember = async (userId: string) => {
    // Confirm dialog could be improved, but browser confirm is simple for now
    if (!confirm('Are you sure you want to remove this member?')) return;

    const result = await removeOrganizationMemberAction(organizationId, userId);
    if (result.success) {
      toast.success('Member removed');
      setMemberList((prev) => prev.filter((m) => m.user.id !== userId));
    } else {
      toast.error(result.error);
    }
  };

  // --- Extra Workspace Access ---
  const handleToggleAccess = async (
    userId: string,
    workspaceId: string,
    hasAccess: boolean,
  ) => {
    const result = await toggleWorkspaceAccessAction(
      organizationId,
      workspaceId,
      userId,
      hasAccess,
    );
    if (result.success) {
      setMemberList((prev) =>
        prev.map((m) => {
          if (m.user.id === userId) {
            const newContributions = hasAccess
              ? [...m.user.contributions, { workspaceId }]
              : m.user.contributions.filter(
                  (c) => c.workspaceId !== workspaceId,
                );
            return {
              ...m,
              user: { ...m.user, contributions: newContributions },
            };
          }
          return m;
        }),
      );
      toast.success(hasAccess ? 'Access granted' : 'Access removed');
    } else {
      toast.error(result.error);
    }
  };

  // Sort: Owner first, then by name
  const sortedMembers = [...memberList].sort((a, b) => {
    if (a.role === 'owner' && b.role !== 'owner') return -1;
    if (a.role !== 'owner' && b.role === 'owner') return 1;
    return (a.user.name || '').localeCompare(b.user.name || '');
  });

  return (
    <div className="space-y-4">
      {/* Invite Button Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-2">
        <div>
          <h3 className="text-zinc-300 font-medium">
            Active Members ({sortedMembers.length})
          </h3>
        </div>

        <InviteMemberDialog organizationId={organizationId} />
      </div>

      {/* Member List */}
      <div className="divide-y divide-zinc-800/50">
        {sortedMembers.map((member) => (
          <MemberListItem
            key={member.user.id}
            member={member}
            currentUserId={currentUserId}
            roles={roles}
            workspaces={workspaces}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveMember}
            onToggleAccess={handleToggleAccess}
          />
        ))}
      </div>
    </div>
  );
}
