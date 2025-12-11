'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import Image from 'next/image';
import {
  X,
  Search,
  User as UserIcon,
  Users,
  Building2,
  Loader2,
  ChevronRight,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

// Types
import type { WorkspaceContributorInput } from '../types/workspace.types';
import {
  searchUsers,
  type SearchUserResult,
} from '@/features/users/actions/search-users';

interface WorkspaceFormData {
  name: string;
  description?: string;
  contributors: WorkspaceContributorInput[];
}

export default function NewWorkspacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const form = useForm<WorkspaceFormData>({
    defaultValues: {
      name: '',
      description: '',
      contributors: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'contributors',
  });

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        // Filter out users already added
        const currentContributorUsernames = form
          .getValues('contributors')
          .map((c) => c.username);
        setSearchResults(
          results.filter(
            (u) => !currentContributorUsernames.includes(u.username || ''),
          ),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fields, form]);

  const addContributor = (user: SearchUserResult) => {
    if (!user.username) return;
    append({
      username: user.username,
      role: 'member',
    });
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          contributors: data.contributors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const workspace = await response.json();
      router.push(`/dashboard/workspaces/${workspace.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Background with Grid Pattern
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-2xl relative z-10">
        <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-inner">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Create Workspace
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 ml-1">
              Set up a shared environment for your prompts and projects.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-8 pt-8">
                {/* Error Banner */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                    <X className="h-5 w-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* --- Section 1: General Info --- */}
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{
                      required: 'Workspace name is required',
                      minLength: {
                        value: 3,
                        message: 'Must be at least 3 characters',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">
                          Workspace Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Acme Corp Engineering"
                            className="h-11 bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-zinc-100 placeholder:text-zinc-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">
                          Description{' '}
                          <span className="text-zinc-500 ml-1">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What is this workspace for?"
                            className="min-h-[100px] resize-none bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-zinc-100 placeholder:text-zinc-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="h-px w-full bg-zinc-800/50" />

                {/* --- Section 2: Team Members --- */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                        <Users className="h-4 w-4 text-zinc-500" />
                        Team Members
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Invite colleagues to collaborate.
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {fields.length} added
                    </span>
                  </div>

                  {/* Search Input Area */}
                  <div className="relative group">
                    <div className="relative">
                      <Search
                        className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchFocused ? 'text-white' : 'text-zinc-500'}`}
                      />
                      <Input
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() =>
                          setTimeout(() => setSearchFocused(false), 200)
                        } // Delay to allow click on result
                        className="pl-10 h-11 bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-zinc-100 placeholder:text-zinc-600"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                        </div>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {(searchResults.length > 0 ||
                      (searchQuery.length >= 2 && !isSearching)) &&
                      searchFocused && (
                        <div className="absolute z-20 w-full mt-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl ring-1 ring-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {searchResults.length > 0 ? (
                            searchResults.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => addContributor(user)}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3 group/item"
                              >
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.name || ''}
                                    width={32}
                                    height={32}
                                    className="rounded-full ring-2 ring-zinc-900"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-zinc-200 ring-2 ring-zinc-900">
                                    <UserIcon className="h-4 w-4" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="text-zinc-200 font-medium text-sm group-hover/item:text-white transition-colors">
                                    {user.name}
                                  </div>
                                  <div className="text-zinc-500 text-xs">
                                    @{user.username}
                                  </div>
                                </div>
                                <div className="text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <span className="text-xs font-medium bg-blue-500/10 px-2 py-1 rounded-md">
                                    Add
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-8 text-center flex flex-col items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                <Search className="h-4 w-4 text-zinc-600" />
                              </div>
                              <p className="text-zinc-500 text-sm">
                                No users found.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Added Contributors List */}
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
                            {form
                              .getValues(`contributors.${index}.username`)
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-zinc-200 text-sm font-medium">
                              @
                              {form.getValues(`contributors.${index}.username`)}
                            </div>
                            <div className="text-zinc-500 text-xs">
                              Will be notified via email
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Select
                            value={form.getValues(`contributors.${index}.role`)}
                            onValueChange={(value) => {
                              const validRole = value as
                                | 'co-owner'
                                | 'moderator'
                                | 'member';
                              update(index, {
                                ...form.getValues(`contributors.${index}`),
                                role: validRole,
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 w-[110px] bg-zinc-950 border-zinc-800 text-xs focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="moderator">
                                Moderator
                              </SelectItem>
                              <SelectItem value="co-owner">Co-Owner</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {fields.length === 0 && (
                      <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-900/20">
                        <Users className="h-8 w-8 text-zinc-700 mb-2" />
                        <p className="text-zinc-500 text-sm">
                          You haven&apos;t added any team members yet.
                          <br />
                          You can always add them later.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 pt-6 pb-8 border-t border-zinc-800/50 bg-zinc-900/30">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-zinc-200 font-medium px-6 min-w-[140px]"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Workspace
                      <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
