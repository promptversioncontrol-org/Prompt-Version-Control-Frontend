'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Actions
import { createOrganizationAction } from '../actions/create-organization';
import { getUserWorkspacesAction } from '@/features/workspaces/actions/get-user-workspaces';
import {
  searchUsers,
  type SearchUserResult,
} from '@/features/users/actions/search-users';

// Contracts / DTOs
import {
  createOrganizationSchema,
  type CreateOrganizationDto,
} from '../contracts/create-organization.dto';

// UI Components
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

// Icons
import {
  Loader2,
  Plus,
  Trash2,
  Building2,
  Users,
  ChevronRight,
  Check,
  Search,
  User as UserIcon,
} from 'lucide-react';

export function CreateOrganizationForm({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<
    { id: string; name: string | null; slug: string }[]
  >([]);
  const router = useRouter();

  // Search State for Invitations
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Temporary state for inputs (not part of the form state directly until added)
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<
    'member' | 'moderator' | 'owner'
  >('member');

  // --- Form Initialization using DTO ---
  const form = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      workspacesToCreate: ['Production', 'Staging'], // Pre-fill with suggestions
      workspacesToLink: [],
      invitations: [],
    },
  });

  // Load user workspaces
  useEffect(() => {
    const loadWorkspaces = async () => {
      const res = await getUserWorkspacesAction();
      if (res.success && res.workspaces) {
        setAvailableWorkspaces(res.workspaces);
      }
    };
    loadWorkspaces();
  }, [userId]);

  // Auto-generate slug from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (watchName && !form.getFieldState('slug').isDirty) {
      form.setValue(
        'slug',
        watchName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      );
    }
  }, [watchName, form]);

  // Debounced search logic for invitations
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inviteEmail.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchUsers(inviteEmail);
        const currentEmails = form.getValues('invitations').map((i) => i.email);
        setSearchResults(
          results.filter((u) => u.email && !currentEmails.includes(u.email)),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteEmail, form]);

  const addSearchUser = (user: SearchUserResult) => {
    if (!user.email) return;
    setInviteEmail(user.email);
    setSearchResults([]);
    setSearchFocused(false);
  };

  async function onSubmit(values: CreateOrganizationDto) {
    setIsPending(true);
    try {
      const result = await createOrganizationAction({ ...values, userId });
      if (result.success) {
        router.push(`/dashboard/organizations/`);
        router.refresh();
      } else {
        console.error(result.error);
        // You could add a toast error here
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  // --- Stepper Logic ---
  const nextStep = async () => {
    // Validate fields for current step before moving
    const fields =
      step === 1
        ? (['name', 'slug', 'description', 'website'] as const)
        : step === 2
          ? (['workspacesToCreate', 'workspacesToLink'] as const)
          : [];

    if (step < 3) {
      // @ts-expect-error - Trigger validation for subset of fields
      const valid = await form.trigger(fields);
      if (valid) setStep((s) => s + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  // --- Helper Functions for Arrays ---
  const addWorkspaceToCreate = () => {
    if (!newWorkspaceName.trim()) return;
    const current = form.getValues('workspacesToCreate') || [];
    if (!current.includes(newWorkspaceName)) {
      form.setValue('workspacesToCreate', [...current, newWorkspaceName]);
    }
    setNewWorkspaceName('');
  };

  const removeWorkspaceToCreate = (name: string) => {
    const current = form.getValues('workspacesToCreate') || [];
    form.setValue(
      'workspacesToCreate',
      current.filter((w) => w !== name),
    );
  };

  const addInvitation = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    const current = form.getValues('invitations') || [];
    if (!current.find((i) => i.email === inviteEmail)) {
      form.setValue('invitations', [
        ...current,
        { email: inviteEmail, role: inviteRole },
      ]);
    }
    setInviteEmail('');
    setInviteRole('member');
  };

  const removeInvitation = (email: string) => {
    const current = form.getValues('invitations') || [];
    form.setValue(
      'invitations',
      current.filter((i) => i.email !== email),
    );
  };

  const toggleLinkWorkspace = (id: string) => {
    const current = form.getValues('workspacesToLink') || [];
    if (current.includes(id)) {
      form.setValue(
        'workspacesToLink',
        current.filter((w) => w !== id),
      );
    } else {
      form.setValue('workspacesToLink', [...current, id]);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl px-6">
        {/* Animated Stepper */}
        <div className="relative flex items-center justify-between mb-10 px-4">
          {/* Progress Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-white transition-all duration-500 z-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-bold text-sm',
                  step === s ? 'ring-4 ring-white/10' : '', // Pulse effect for active
                  step >= s
                    ? 'bg-zinc-950 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500',
                )}
              >
                {step > s ? <Check className="w-5 h-5 text-white" /> : s}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300 absolute -bottom-6 w-32 text-center',
                  step >= s ? 'text-white' : 'text-zinc-600',
                )}
              >
                {s === 1 && 'Details'}
                {s === 2 && 'Workspaces'}
                {s === 3 && 'Team'}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Top Highlight Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              {step === 1 && 'Organization Identity'}
              {step === 2 && 'Setup Environment'}
              {step === 3 && 'Assemble Team'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {step === 1 &&
                'Create a distinct identity for your organization.'}
              {step === 2 && 'Manage your workspaces structure.'}
              {step === 3 && 'Invite members to collaborate immediately.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[300px]">
            <Form {...form}>
              <form className="space-y-6">
                {/* STEP 1: Details */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-left-8 duration-500">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-200">
                            Organization Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Acme Corp"
                              {...field}
                              className="bg-zinc-900/50 border-zinc-700 focus:border-white/50 focus:ring-white/20 text-white placeholder:text-zinc-600 transition-all h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-200">
                            URL Slug
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center group focus-within:ring-2 focus-within:ring-white/20 rounded-md">
                              <span className="bg-zinc-900 border border-r-0 border-zinc-700 rounded-l-md px-3 h-11 flex items-center text-sm text-zinc-400 group-focus-within:border-white/50 transition-colors">
                                pvc.app/
                              </span>
                              <Input
                                placeholder="acme-corp"
                                {...field}
                                className="rounded-l-none bg-zinc-900/50 border-zinc-700 focus:border-white/50 focus-visible:ring-0 text-white placeholder:text-zinc-600 h-11 transition-colors"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-200">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What is this organization about?"
                              {...field}
                              className="bg-zinc-900/50 border-zinc-700 focus:border-white/50 text-white placeholder:text-zinc-600 resize-none min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* STEP 2: Workspaces */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    {/* Create New */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
                        <Plus className="w-4 h-4 text-white" /> Create New
                      </h3>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Workspace Name (e.g. Mobile App)"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), addWorkspaceToCreate())
                          }
                          className="bg-zinc-900/50 border-zinc-700 text-white h-10 placeholder:text-zinc-600 focus:border-white/50 focus:ring-white/20"
                        />
                        <Button
                          type="button"
                          onClick={addWorkspaceToCreate}
                          className="bg-white text-black hover:bg-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[50px] bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                        {form.watch('workspacesToCreate')?.map((w, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 h-8 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700 animate-in zoom-in duration-300"
                          >
                            {w}
                            <button
                              type="button"
                              onClick={() => removeWorkspaceToCreate(w)}
                              className="ml-2 hover:bg-red-500/20 hover:text-red-400 rounded-full p-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!form.watch('workspacesToCreate') ||
                          form.watch('workspacesToCreate')?.length === 0) && (
                          <span className="text-zinc-600 text-sm italic self-center px-2">
                            No new workspaces added yet.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Link Existing */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
                        <Building2 className="w-4 h-4 text-zinc-400" /> Link
                        Existing
                      </h3>
                      <div className="bg-zinc-900/30 rounded-lg border border-zinc-800 overflow-hidden">
                        {availableWorkspaces.length === 0 ? (
                          <div className="text-zinc-500 text-sm p-6 text-center">
                            No unlinked workspaces found.
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {availableWorkspaces.map((w) => {
                              const isSelected = form
                                .watch('workspacesToLink')
                                ?.includes(w.id);
                              return (
                                <div
                                  key={w.id}
                                  className={cn(
                                    'flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-200 group',
                                    isSelected
                                      ? 'bg-white/10 border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                                      : 'bg-transparent border-transparent hover:bg-zinc-800 hover:border-zinc-700',
                                  )}
                                  onClick={() => toggleLinkWorkspace(w.id)}
                                >
                                  <div className="flex flex-col">
                                    <span
                                      className={cn(
                                        'text-sm font-medium transition-colors',
                                        isSelected
                                          ? 'text-white'
                                          : 'text-zinc-300 group-hover:text-white',
                                      )}
                                    >
                                      {w.name || 'Untitled'}
                                    </span>
                                    <span className="text-xs text-zinc-600 font-mono group-hover:text-zinc-500">
                                      {w.slug}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                                      isSelected
                                        ? 'bg-white border-white'
                                        : 'border-zinc-600 bg-zinc-900',
                                    )}
                                  >
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-black" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Invite Team */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-zinc-400" /> Invite
                        Members
                      </h3>

                      <div className="flex gap-2 items-start">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                          <div className="md:col-span-2 relative group z-50">
                            <div className="relative">
                              <Search
                                className={cn(
                                  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
                                  searchFocused
                                    ? 'text-white'
                                    : 'text-zinc-500',
                                )}
                              />
                              <Input
                                placeholder="Search by name or email..."
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() =>
                                  setTimeout(() => setSearchFocused(false), 200)
                                }
                                className="pl-10 bg-zinc-900/50 text-white border-zinc-700 h-10 placeholder:text-zinc-600 focus:border-white/50 focus:ring-white/20"
                              />
                              {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                </div>
                              )}
                            </div>

                            {/* Floating Search Results */}
                            {(searchResults.length > 0 ||
                              (inviteEmail.length >= 2 &&
                                !isSearching &&
                                searchFocused)) &&
                              searchFocused && (
                                <div className="absolute top-full left-0 w-full mt-2 p-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl ring-1 ring-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                                  {searchResults.length > 0 ? (
                                    searchResults.map((user) => (
                                      <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => addSearchUser(user)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3 group/item"
                                      >
                                        {user.image ? (
                                          <Image
                                            src={user.image}
                                            alt={user.name || ''}
                                            width={28}
                                            height={28}
                                            className="rounded-full ring-1 ring-zinc-700"
                                          />
                                        ) : (
                                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 ring-1 ring-zinc-700">
                                            <UserIcon className="h-4 w-4" />
                                          </div>
                                        )}
                                        <div className="flex-1 overflow-hidden">
                                          <div className="text-zinc-200 font-medium text-sm truncate group-hover/item:text-white transition-colors">
                                            {user.name || 'Unknown'}
                                          </div>
                                          <div className="text-zinc-500 text-xs truncate">
                                            {user.email}
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="p-3 text-center">
                                      <p className="text-zinc-500 text-xs">
                                        No users found.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>

                          <Select
                            value={inviteRole}
                            onValueChange={(
                              v: 'member' | 'moderator' | 'owner',
                            ) => setInviteRole(v)}
                          >
                            <SelectTrigger className="bg-zinc-900/50 text-white border-zinc-700 h-10 focus:ring-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="moderator">
                                Moderator
                              </SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          onClick={addInvitation}
                          className="bg-white text-black hover:bg-zinc-200 h-10 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="space-y-2 mt-4">
                        {form.watch('invitations')?.map((inv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-800 animate-in slide-in-from-bottom-2 duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                {inv.email.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-200">
                                  {inv.email}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                  {inv.role}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInvitation(inv.email)}
                              className="bg-transparent hover:bg-red-500/10 p-2 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!form.watch('invitations') ||
                          form.watch('invitations')?.length === 0) && (
                          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-800 rounded-lg bg-white/[0.01]">
                            <Users className="w-8 h-8 text-zinc-700 mb-2" />
                            <span className="text-zinc-500 text-sm">
                              No pending invitations.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-zinc-800/50 py-6 bg-zinc-950/30">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || isPending}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={isPending}
              className={cn(
                'bg-white text-black hover:bg-zinc-200 min-w-[120px] transition-all duration-300 relative overflow-hidden group',
                step === 3 && 'hover:scale-105',
              )}
            >
              {/* CSS Animation Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />

              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 3 ? (
                <span className="flex items-center gap-2">
                  Create <Check className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Helper Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Press{' '}
            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
              Enter
            </kbd>{' '}
            to continue
          </p>
        </div>
      </div>
    </div>
  );
}
