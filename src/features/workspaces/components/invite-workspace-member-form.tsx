'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Loader2, Mail, CheckCircle2, UserPlus } from 'lucide-react';
import { inviteWorkspaceMemberAction } from '../actions/invite-workspace-member';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer', 'member']),
});

interface InviteWorkspaceMemberFormProps {
  workspaceId: string;
}

export function InviteWorkspaceMemberForm({
  workspaceId,
}: InviteWorkspaceMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  async function onSubmit(values: z.infer<typeof inviteSchema>) {
    setIsLoading(true);
    setSuccess(false);
    try {
      const result = await inviteWorkspaceMemberAction(
        workspaceId,
        values.email,
        values.role,
      );

      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        form.setError('email', { message: result.error });
      }
    } catch (error) {
      console.error(error);
      form.setError('email', { message: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
          <UserPlus className="h-5 w-5 text-emerald-500" />
          Invite Members
        </CardTitle>
        <CardDescription>
          Invite existing users to this workspace. They must have an account
          first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                          placeholder="colleague@example.com"
                          className="pl-9 bg-zinc-950 border-zinc-700"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="w-full md:w-[150px]">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-700">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  'Invite'
                )}
              </Button>
            </div>
            {success && (
              <p className="text-sm text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Invitation sent successfully!
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
