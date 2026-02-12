'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { addSshKey, deleteSshKey } from '../actions/ssh-actions';
import { Trash2, Key } from 'lucide-react';

import {
  createSshKeySchema,
  type CreateSshKeyDto,
  type SshKeyModel,
} from '../contracts/ssh-key.dto';

interface SshKeyManagerProps {
  initialKeys: SshKeyModel[];
}

export function SshKeyManager({ initialKeys }: SshKeyManagerProps) {
  const [keys, setKeys] = useState<SshKeyModel[]>(initialKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateSshKeyDto>({
    resolver: zodResolver(createSshKeySchema),
    defaultValues: {
      name: '',
      publicKey: '',
    },
  });

  const onSubmit = async (data: CreateSshKeyDto) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('publicKey', data.publicKey);

    const result = await addSshKey(formData);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
      // Optimistic update or re-fetch could be done here.
      // Since we used revalidatePath in the action, the page should refresh if we use a router refresh,
      // but for client state, we might need to rely on the server re-render or manual update.
      // For simplicity, we'll let the next navigation/refresh update the list,
      // or we could return the new key from the action.
      // Let's just refresh the page for now to get the new list.
      window.location.reload();
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return;

    const result = await deleteSshKey(id);
    if (result.success) {
      setKeys(keys.filter((k) => k.id !== id));
    } else {
      alert('Failed to delete key');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Add New SSH Key</CardTitle>
          <CardDescription className="text-zinc-400">
            Add your public SSH key to access your workspaces via terminal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-900/20 border border-red-900/50 rounded-md">
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. My Laptop"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publicKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">Key</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ssh-rsa AAAA..."
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 font-mono text-sm min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isLoading ? 'Adding...' : 'Add SSH Key'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Your SSH Keys</h2>
        {keys.length === 0 ? (
          <div className="text-zinc-500 text-center py-8 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
            No SSH keys added yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-800 rounded-md">
                    <Key className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200">
                      {key.name || 'Untitled Key'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      {key.fingerprint}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Added on {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(key.id)}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
