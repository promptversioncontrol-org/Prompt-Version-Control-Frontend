'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Loader2, UploadCloud, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { createTicket } from '../actions/create-ticket';
import { getPresignedUploadUrl } from '../actions/upload-attachment';

const ticketSchema = z.object({
  subject: z.string().min(3, 'Subject is too short'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['normal', 'high', 'urgent']),
  message: z.string().min(10, 'Please provide more details (min 10 chars)'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export function CreateTicketForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { success, signedUrl, publicUrl, error } =
        await getPresignedUploadUrl(file.name, file.type);
      if (!success || !signedUrl) throw new Error(error || 'Failed to upload');

      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setAttachments((prev) => [...prev, publicUrl!]);
      toast.success('File uploaded');
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createTicket({ ...data, attachments });
      if (result.success) {
        toast.success('Ticket created successfully');
        router.push(`/dashboard/support/${result.ticketId}`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Subject & Category */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-normal">Subject</Label>
          <Input
            placeholder="E.g. Unable to connect remote repo"
            {...form.register('subject')}
            className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 h-11 text-zinc-200"
          />
          {form.formState.errors.subject && (
            <p className="text-xs text-red-400">
              {form.formState.errors.subject.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-normal">Category</Label>
          <Select
            onValueChange={(val) => form.setValue('category', val)}
            defaultValue={form.getValues('category')}
          >
            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-11 text-zinc-200 focus:ring-0 focus:border-zinc-700">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="billing">Billing & Account</SelectItem>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-xs text-red-400">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="space-y-2">
        <Label className="text-zinc-400 font-normal">Description</Label>
        <Textarea
          placeholder="Please describe your issue in detail..."
          className="min-h-[200px] bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-200 resize-none p-4 leading-relaxed"
          {...form.register('message')}
        />
        {form.formState.errors.message && (
          <p className="text-xs text-red-400">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      {/* Priority & Upload */}
      <div className="flex flex-col sm:flex-row gap-6 items-start justify-between border-t border-zinc-800 pt-6">
        <div className="space-y-2 w-full sm:w-auto">
          <Label className="text-zinc-400 font-normal">Priority Level</Label>
          <Select
            onValueChange={(val: string) =>
              form.setValue('priority', val as 'normal' | 'high' | 'urgent')
            }
            defaultValue="normal"
          >
            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 w-full sm:w-[180px] h-10 text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high" className="text-amber-500">
                High Priority
              </SelectItem>
              <SelectItem value="urgent" className="text-red-500 font-medium">
                Urgent
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto flex-1 flex flex-col items-end gap-3">
          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {attachments.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                >
                  <FileText className="w-3 h-3 text-zinc-500" />
                  <span>Attachment {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="hover:text-white ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
                className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 w-full"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4 mr-2" />
                )}
                Attach File
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto px-8"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Submit Ticket
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
