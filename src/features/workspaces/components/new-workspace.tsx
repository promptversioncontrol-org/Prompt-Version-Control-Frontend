'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
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
import type {
  WorkspaceContributorInput,
  WorkspaceVisibility,
} from '../types/workspace.types';

interface WorkspaceFormData {
  name: string;
  description?: string;
  visibility: WorkspaceVisibility;
  contributors: WorkspaceContributorInput[];
}

export default function NewWorkspacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkspaceFormData>({
    defaultValues: {
      name: '',
      description: '',
      visibility: 'private',
      contributors: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contributors',
  });

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
          visibility: data.visibility,
          contributors: data.contributors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const workspace = await response.json();
      router.push(`/${workspace.username}/${workspace.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container max-w-2xl mx-auto py-8 px-4 relative z-10">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Create New Workspace
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create a workspace to organize your prompts and conversations
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-zinc-200 bg-zinc-950/50 border border-zinc-700/50 rounded-lg backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  rules={{
                    required: 'Workspace name is required',
                    minLength: {
                      value: 3,
                      message: 'Workspace name must be at least 3 characters',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-200 font-medium">
                        Workspace Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Workspace"
                          className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-white/30 focus:ring-white/10 backdrop-blur-sm transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-zinc-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-200 font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this workspace is for..."
                          rows={3}
                          className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-white/30 focus:ring-white/10 backdrop-blur-sm transition-all resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-200 font-medium">
                        Visibility
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 rounded-md backdrop-blur-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                          {...field}
                        >
                          <option value="private" className="bg-zinc-900">
                            Private - Only you
                          </option>
                          <option value="public" className="bg-zinc-900">
                            Public - Everyone
                          </option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <div className="px-6 pb-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-zinc-200">Team</h3>
                  <p className="text-sm text-zinc-400">
                    Add contributors to your workspace
                  </p>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`contributors.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Contributor username"
                                className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-white/30 focus:ring-white/10 backdrop-blur-sm transition-all"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: '' })}
                    className="w-full border-dashed border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  >
                    + Add Contributor
                  </Button>
                </div>
              </div>

              <CardFooter className="flex justify-between gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="bg-zinc-800/50 border-zinc-700/50 text-zinc-200 hover:bg-zinc-700/50 hover:text-white backdrop-blur-sm transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-zinc-100 to-white hover:from-white hover:to-zinc-100 text-black font-medium shadow-lg shadow-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Workspace'
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
