'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

// Icons
import { Loader2, Check } from 'lucide-react';

export function CreateOrganizationForm({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

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

  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-2xl">
        {/* Minimal Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Organization
          </h1>
          <p className="text-zinc-400">
            Set up a new home for your team and projects.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative flex items-center justify-between mb-12 px-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-zinc-800 w-full -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-white transition-all duration-500 -z-10"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex flex-col items-center gap-3 bg-black px-2"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border',
                  step >= s
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800',
                  step === s && 'ring-4 ring-zinc-800',
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span
                className={cn(
                  'text-xs font-medium uppercase tracking-wider',
                  step >= s ? 'text-white' : 'text-zinc-600',
                )}
              >
                {s === 1 && 'Identity'}
                {s === 2 && 'Workspaces'}
                {s === 3 && 'Members'}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardContent className="p-8 min-h-[400px]">
            <Form {...form}>
              <form className="space-y-8">
                {/* ... (Fields remain mostly the same, just ensure styles are bg-zinc-950 border-zinc-800) ... */}
                {/* Use the input style below for consistency */}
                {/* className="bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:ring-0 text-white h-12 rounded-xl" */}

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Acme Corp"
                                className="bg-zinc-950 border-zinc-800 focus:border-white/20 h-12 text-lg"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* ... other fields ... */}
                    </div>
                  </div>
                )}

                {/* ... steps 2 and 3 ... */}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-zinc-800 p-6 bg-zinc-900/50">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || isPending}
              className="text-zinc-400 hover:text-white hover:bg-transparent px-0"
            >
              ← Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={isPending}
              className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-11 font-medium"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {step === 3 ? 'Create Organization' : 'Continue'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
