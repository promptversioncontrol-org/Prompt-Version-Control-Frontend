'use client';

import React, { useState } from 'react';
import { Send, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import { generateTelegramToken } from '../contracts/generate-telegram-token';
import { UserTelegram } from '@prisma/client';

interface TelegramSettingsProps {
  initialConnectedAccount: UserTelegram | null;
}

export function TelegramSettings({
  initialConnectedAccount,
}: TelegramSettingsProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectedAccount] = useState<UserTelegram | null>(
    initialConnectedAccount,
  );

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const newToken = await generateTelegramToken();
      setToken(newToken);
    } catch (error) {
      console.error('Failed to generate token:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Send className="text-sky-500" size={24} />
            Telegram Notifications
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Connect your Telegram account to receive real-time notifications
            about your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div
            className={`p-4 rounded-lg border ${connectedAccount ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${connectedAccount ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}
                />
                <div>
                  <p
                    className={`font-medium ${connectedAccount ? 'text-emerald-400' : 'text-zinc-400'}`}
                  >
                    {connectedAccount ? 'Connected' : 'Not Connected'}
                  </p>
                  {connectedAccount && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Chat ID: {connectedAccount.chatId}
                    </p>
                  )}
                </div>
              </div>
              {connectedAccount && (
                <Check className="text-emerald-500" size={20} />
              )}
            </div>
          </div>

          {/* Instructions */}
          {!connectedAccount && (
            <div className="space-y-4">
              <div className="text-sm text-zinc-400 space-y-2">
                <p>To connect your account:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 text-zinc-300">
                  <li>
                    Start a chat with our bot{' '}
                    <a
                      href="https://t.me/pvc_notifications_bot"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      @pvc_notifications_bot
                    </a>
                  </li>
                  <li>Generate a unique connection token below</li>
                  <li>Send the token to the bot</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                {!token ? (
                  <Button
                    onClick={handleGenerateToken}
                    disabled={loading}
                    className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Generate Connection Token
                  </Button>
                ) : (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">
                      Your Token
                    </label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={token}
                        className="bg-black/40 border-zinc-700 font-mono text-sky-400"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        className="border-zinc-700 hover:bg-zinc-800 shrink-0"
                      >
                        {copied ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} className="text-zinc-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {connectedAccount && (
            <Alert className="bg-sky-500/10 border-sky-500/20 text-sky-200">
              <AlertCircle className="h-4 w-4 text-sky-500" />
              <AlertTitle>You are all set!</AlertTitle>
              <AlertDescription className="text-sky-200/70">
                You will now receive notifications for important workspace
                events directly in Telegram.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
