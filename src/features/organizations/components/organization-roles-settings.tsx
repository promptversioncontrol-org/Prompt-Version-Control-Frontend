'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Trash2,
  Plus,
  Shield,
  Loader2,
  Search,
  Users,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createOrganizationRoleAction,
  deleteOrganizationRoleAction,
} from '../actions/manage-roles';

interface Role {
  id: string;
  name: string;
  workspaceIds: string[];
  membersCount?: number;
}

interface Workspace {
  id: string;
  name: string | null;
  slug: string;
}

interface OrganizationRolesSettingsProps {
  organizationId: string;
  roles: Role[];
  workspaces: Workspace[];
}

export function OrganizationRolesSettings({
  organizationId,
  roles: initialRoles,
  workspaces,
}: OrganizationRolesSettingsProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  // Create Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>(
    [],
  );
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Dialog State
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter workspaces in the modal based on search
  const filteredWorkspaces = useMemo(() => {
    if (!workspaceSearch) return workspaces;
    return workspaces.filter((ws) =>
      ws.name?.toLowerCase().includes(workspaceSearch.toLowerCase()),
    );
  }, [workspaces, workspaceSearch]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setIsCreating(true);

    try {
      const result = await createOrganizationRoleAction(
        organizationId,
        newRoleName,
        selectedWorkspaceIds,
      );

      if (result.success && result.role) {
        setRoles([...roles, { ...result.role, membersCount: 0 }]);
        setNewRoleName('');
        setSelectedWorkspaceIds([]);
        setWorkspaceSearch('');
        setIsCreateOpen(false);
        toast.success('Role created successfully');
      } else {
        toast.error(result.error || 'Failed to create role');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);

    try {
      const result = await deleteOrganizationRoleAction(
        organizationId,
        roleToDelete,
      );

      if (result.success) {
        setRoles(roles.filter((r) => r.id !== roleToDelete));
        toast.success('Role deleted');
      } else {
        toast.error(result.error || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
      setRoleToDelete(null);
    }
  };

  const toggleWorkspace = (wsId: string) => {
    setSelectedWorkspaceIds((prev) =>
      prev.includes(wsId) ? prev.filter((id) => id !== wsId) : [...prev, wsId],
    );
  };

  const toggleAllWorkspaces = () => {
    if (selectedWorkspaceIds.length === filteredWorkspaces.length) {
      setSelectedWorkspaceIds([]);
    } else {
      setSelectedWorkspaceIds(filteredWorkspaces.map((ws) => ws.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-400" />
            Custom Roles
          </h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Create roles to provide granular access control. Members with these
            roles will strictly have access only to the selected workspaces.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-zinc-200">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Define a new role and select which workspaces it can access.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Role Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Role Name
                </label>
                <Input
                  placeholder="e.g. Content Reviewer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus:ring-zinc-700 focus:border-zinc-700"
                />
              </div>

              {/* Workspaces Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-200">
                    Accessible Workspaces
                  </label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={toggleAllWorkspaces}
                    className="text-xs text-zinc-400 hover:text-white h-auto p-0"
                  >
                    {selectedWorkspaceIds.length === filteredWorkspaces.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>

                {/* Search Workspaces */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search workspaces..."
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-sm"
                  />
                </div>

                <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
                  <ScrollArea className="h-[240px]">
                    <div className="p-2 space-y-1">
                      {filteredWorkspaces.length > 0 ? (
                        filteredWorkspaces.map((ws) => (
                          <div
                            key={ws.id}
                            onClick={() => toggleWorkspace(ws.id)}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                          >
                            <Checkbox
                              id={`ws-${ws.id}`}
                              checked={selectedWorkspaceIds.includes(ws.id)}
                              onCheckedChange={() => toggleWorkspace(ws.id)}
                              className="border-zinc-600 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-black"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm text-zinc-200 font-medium group-hover:text-white">
                                {ws.name}
                              </span>
                              <span className="text-xs text-zinc-500">
                                /{ws.slug}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-sm text-zinc-500">
                          No workspaces found.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <p className="text-xs text-zinc-500 text-right">
                  {selectedWorkspaceIds.length} workspaces selected
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={isCreating || !newRoleName}
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  </>
                ) : (
                  'Create Role'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid of Roles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="bg-zinc-900/20 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40 transition-all duration-300 group flex flex-col"
          >
            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-100">
                  {role.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-zinc-500">
                  ID: {role.id.slice(0, 8)}...
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={() => setRoleToDelete(role.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Access Level
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.workspaceIds.length > 0 ? (
                    <>
                      {role.workspaceIds.slice(0, 4).map((wsId) => {
                        const ws = workspaces.find((w) => w.id === wsId);
                        return ws ? (
                          <Badge
                            key={wsId}
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50 font-normal"
                          >
                            <Building2 className="w-3 h-3 mr-1 opacity-50" />
                            {ws.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.workspaceIds.length > 4 && (
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-500 border-dashed"
                        >
                          +{role.workspaceIds.length - 4} more
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-zinc-600 italic flex items-center">
                      <Shield className="w-3 h-3 mr-1.5" /> No specific access
                    </span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-zinc-800/50 bg-zinc-950/30 text-xs text-zinc-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{role.membersCount || 0} members assigned</span>
              </div>
            </CardFooter>
          </Card>
        ))}

        {/* Empty State */}
        {roles.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <Shield className="mx-auto h-12 w-12 text-zinc-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-200">
              No custom roles defined
            </h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
              Create your first custom role to start managing workspace-specific
              access for your team members.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-zinc-700 text-black hover:text-white hover:bg-zinc-800"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2 text-black" /> Create First Role
            </Button>
          </div>
        )}
      </div>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Custom Role?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. Members currently assigned to this
              role will lose their specific workspace access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteRole();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                'Delete Role'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
