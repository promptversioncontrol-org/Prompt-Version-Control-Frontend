'use client';

import { useState, useRef, useEffect } from 'react';
import { TicketMessage, TicketAttachment } from '@prisma/client';
import { useSession } from '@/shared/lib/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Loader2,
  Send,
  Paperclip,
  X,
  FileIcon,
  DownloadCloud,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sendMessage } from '../actions/send-message';
import { toast } from 'sonner';
import { getPresignedUploadUrl } from '../actions/upload-attachment';
import { cn } from '@/shared/lib/utils';

type MessageWithUser = TicketMessage & {
  user: {
    image: string | null;
    name: string | null;
    role: string;
    id: string;
    email: string;
  };
  attachments: TicketAttachment[];
};

interface TicketChatProps {
  ticketId: string;
  initialMessages: MessageWithUser[];
  status: string;
}

export function TicketChat({
  ticketId,
  initialMessages,
  status,
}: TicketChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { success, signedUrl, publicUrl, error } =
        await getPresignedUploadUrl(file.name, file.type);

      if (!success || !signedUrl) throw new Error(error);

      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setAttachments((prev) => [...prev, publicUrl!]);
      toast.success('File attached');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !session?.user)
      return;

    setIsSending(true);
    try {
      const result = await sendMessage(ticketId, newMessage, attachments);
      if (result.success) {
        const optimisticMsg: MessageWithUser = {
          id: Math.random().toString(),
          content: newMessage,
          createdAt: new Date(),
          ticketId,
          userId: session.user.id,
          user: {
            id: session.user.id,
            name: session.user.name || null,
            email: session.user.email || '',
            image: session.user.image || null,
            role: (session.user as { role?: string }).role || 'user',
          },
          attachments: attachments.map((url) => ({
            id: Math.random().toString(),
            url,
            fileName: 'Attachment',
            fileType: 'unknown',
            messageId: 'temp',
            createdAt: new Date(),
          })),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setNewMessage('');
        setAttachments([]);
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const isClosed = status === 'CLOSED';

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] border border-zinc-800 rounded-2xl bg-zinc-950 shadow-2xl overflow-hidden relative">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {messages.map((msg) => {
          if (!msg.user) return null; // Safety check

          const isMe = msg.userId === session?.user?.id;
          const isAdmin =
            msg.user.role === 'admin' ||
            msg.user.email === 'pukaluk.adam505@gmail.com';

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-4 animate-in slide-in-from-bottom-2 duration-300',
                isMe ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <Avatar className="h-9 w-9 mt-1 border border-zinc-800 shrink-0">
                <AvatarImage src={msg.user.image || undefined} />
                <AvatarFallback
                  className={cn(
                    'text-xs font-medium',
                    isAdmin
                      ? 'bg-indigo-950 text-indigo-400'
                      : 'bg-zinc-900 text-zinc-400',
                  )}
                >
                  {msg.user.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  'flex flex-col max-w-[80%]',
                  isMe ? 'items-end' : 'items-start',
                )}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isAdmin ? 'text-indigo-400' : 'text-zinc-400',
                    )}
                  >
                    {isAdmin ? 'Support Agent' : msg.user.name}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                  </span>
                </div>

                <div
                  className={cn(
                    'p-4 text-sm leading-relaxed shadow-sm relative group',
                    isMe
                      ? 'bg-white text-black rounded-2xl rounded-tr-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm',
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Attachments Grid */}
                  {msg.attachments.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-black/5 (isMe ? 'border-black/5' : 'border-white/5')">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg transition-colors overflow-hidden',
                            isMe
                              ? 'bg-zinc-100 hover:bg-zinc-200'
                              : 'bg-black/40 hover:bg-black/60',
                          )}
                        >
                          <div
                            className={cn(
                              'p-1.5 rounded flex items-center justify-center',
                              isMe ? 'bg-white' : 'bg-zinc-800',
                            )}
                          >
                            {att.fileType?.startsWith('image') ? (
                              <FileIcon className="w-4 h-4 text-zinc-500" />
                            ) : (
                              <FileIcon className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate opacity-90">
                              {att.fileName}
                            </p>
                            <p className="text-[10px] opacity-60 uppercase">
                              File
                            </p>
                          </div>
                          <DownloadCloud className="w-4 h-4 opacity-50 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      {isClosed ? (
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            This ticket has been marked as resolved.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 relative z-10">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {attachments.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-lg border border-zinc-700 overflow-hidden group shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Attachment preview"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <button
                    onClick={() =>
                      setAttachments((p) => p.filter((_, i) => i !== idx))
                    }
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="relative flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[50px] max-h-32 bg-zinc-900 border-zinc-800 focus:border-zinc-700 resize-none py-3 pl-4 pr-12 rounded-xl text-zinc-200 placeholder:text-zinc-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
                  onClick={() =>
                    document.getElementById('chat-upload')?.click()
                  }
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </Button>
                <input
                  id="chat-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,application/pdf"
                />
              </div>
            </div>

            <Button
              size="icon"
              onClick={handleSend}
              disabled={
                (!newMessage.trim() && attachments.length === 0) || isSending
              }
              className="h-[50px] w-[50px] shrink-0 bg-white text-black hover:bg-zinc-200 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="text-[10px] text-zinc-600 mt-2 text-right px-1">
            Press <strong>Enter</strong> to send
          </div>
        </div>
      )}
    </div>
  );
}
