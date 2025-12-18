'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  ImageIcon,
  Layout,
  AlignLeft,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';
import { updateWorkspace } from '@/features/workspaces/actions/update-workspace';
import { deleteWorkspace } from '@/features/workspaces/actions/delete-workspace';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';

interface WorkspaceGeneralSettingsProps {
  workspace: {
    id: string;
    name: string | null;
    description: string | null;
    image: string | null;
    slug: string;
  };
}

export function WorkspaceGeneralSettings({
  workspace,
}: WorkspaceGeneralSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [formData, setFormData] = useState({
    name: workspace.name || '',
    description: workspace.description || '',
    image: workspace.image || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateWorkspace({
        workspaceId: workspace.id,
        name: formData.name,
        description: formData.description,
        image: formData.image,
      });
      toast.success('Workspace updated successfully');
    } catch (error) {
      toast.error('Failed to update workspace');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      // Redirect handled by server action or router.push here if needed
    } catch {
      toast.error('Failed to delete workspace');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <form onSubmit={handleUpdate}>
        <Card className="bg-zinc-950 border-zinc-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-6 bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardDescription className="text-zinc-400 mt-1">
                  Manage your workspace&apos;s public profile and appearance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            {/* Image / Identity Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="space-y-3 shrink-0">
                <Label className="text-zinc-300">Workspace Icon</Label>
                <div className="relative group">
                  <Avatar className="h-24 w-24 rounded-2xl border-2 border-zinc-800 shadow-xl bg-zinc-900">
                    <AvatarImage
                      src={formData.image}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-2xl text-2xl font-bold bg-gradient-to-br from-zinc-800 to-zinc-900 text-white">
                      {formData.name?.[0]?.toUpperCase() || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Optional overlay hint */}
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ImageIcon className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-zinc-300">
                    Icon URL
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-zinc-700 transition-all"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Recommended size: 256x256px. Supports JPG, PNG.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800/50 w-full" />

            {/* Main Form Fields */}
            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Workspace Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-zinc-900/50 border-zinc-800 text-white font-medium focus:border-zinc-600 focus:ring-zinc-700 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Workspace Slug</Label>
                  <div className="relative opacity-70">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      disabled
                      value={workspace.slug}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-300">
                  Description
                </Label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="pl-10 min-h-[100px] bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-zinc-700 resize-none transition-all leading-relaxed"
                    placeholder="What is this workspace for?"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-zinc-900/30 border-t border-zinc-800 py-4 px-6 flex justify-between items-center">
            <span className="text-sm text-zinc-500">Last updated recently</span>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black hover:bg-zinc-200 font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-900/20 bg-gradient-to-br from-red-950/10 to-transparent border-dashed overflow-hidden">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-400/60">
            Irreversible actions. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-zinc-400 max-w-xl">
            <p>
              Deleting this workspace will permanently remove all associated
              data, including files, members, and settings.
              <span className="text-zinc-300 font-medium">
                {' '}
                This action cannot be undone.
              </span>
            </p>
          </div>

          <AlertDialog
            open={isDeleting ? true : undefined}
            onOpenChange={(open) => {
              if (!open && !isDeleting) setDeleteConfirmation('');
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800 shadow-2xl">
              <AlertDialogHeader>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto border border-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <AlertDialogTitle className="text-center text-xl text-white">
                  Delete Workspace?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-zinc-400">
                  This action cannot be undone. This will permanently delete the
                  workspace <strong>{workspace.name}</strong> and remove all
                  associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-4 space-y-3">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  Type{' '}
                  <span className="text-red-400 user-select-all">
                    permanently delete
                  </span>{' '}
                  to confirm
                </Label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="permanently delete"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-red-500/50 focus:ring-red-500/20"
                />
              </div>

              <AlertDialogFooter className="sm:justify-center mt-2">
                <AlertDialogCancel
                  onClick={() => setDeleteConfirmation('')}
                  className="bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={
                    deleteConfirmation !== 'permanently delete' || isDeleting
                  }
                  className="bg-red-600 hover:bg-red-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete Workspace'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
