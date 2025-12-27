'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileSchema,
  type ProfileFormValues,
} from '../schemas/profile-schema';
import { updateProfile } from '../actions/update-profile';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface UserProfileSettingsProps {
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
    description: string | null;
    links: unknown; // JSON type from Prisma
    email: string;
  };
}

export function UserProfileSettings({ user }: UserProfileSettingsProps) {
  const [isPending, setIsPending] = useState(false);

  // Parse links if they are stored as JSON
  const initialLinks = Array.isArray(user.links)
    ? user.links
    : typeof user.links === 'string'
      ? JSON.parse(user.links)
      : [];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      username: user.username || '',
      image: user.image || '',
      description: user.description || '',
      links: initialLinks,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsPending(true);
    try {
      const result = await updateProfile(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="bg-black border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Profile Settings</CardTitle>
        <CardDescription className="text-zinc-400">
          Update your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={form.watch('image') || ''} />
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a URL for your profile picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Name"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Max 500 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel className="text-base">Links</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: '', url: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`links.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Title (e.g. Website)"
                              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`links.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormControl>
                            <Input
                              placeholder="URL (e.g. https://www.adampukaluk.pl)"
                              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No links added yet.
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
