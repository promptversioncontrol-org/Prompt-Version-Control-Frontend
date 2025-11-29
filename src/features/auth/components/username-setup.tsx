'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';

import { AuthBackground } from '@/shared/components/ui/auth-background';

export default function UsernameSetup() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const validateUsername = (
    value: string,
  ): { isValid: boolean; error?: string } => {
    if (!value) {
      return { isValid: false, error: 'Username is required' };
    }
    if (value.length < 3) {
      return {
        isValid: false,
        error: 'Username must be at least 3 characters',
      };
    }
    if (value.length > 30) {
      return {
        isValid: false,
        error: 'Username must be at most 30 characters',
      };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return {
        isValid: false,
        error:
          'Username can only contain letters, numbers, dashes, and underscores',
      };
    }
    if (/^[-_]|[-_]$/.test(value)) {
      return {
        isValid: false,
        error: 'Username cannot start or end with a dash or underscore',
      };
    }
    return { isValid: true };
  };

  const checkAvailability = async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      return;
    }

    const validation = validateUsername(value);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid username');
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value }),
      });

      const data = await response.json();
      setIsAvailable(data.available);

      if (!data.available) {
        setError('Username is already taken');
      }
    } catch {
      setError('Failed to check username availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setIsAvailable(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/set-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set username');
      }

      // Force full reload to update session
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="min-h-screen flex items-center justify-center p-4 flex-grow">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Choose Your Username
            </CardTitle>
            <CardDescription className="text-zinc-400">
              This will be your unique identifier on the platform
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-300 bg-red-950/50 border border-red-800/50 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-200 font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={() => checkAvailability(username)}
                    placeholder="your-username"
                    className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-white/30 focus:ring-white/10 backdrop-blur-sm transition-all"
                    disabled={isLoading}
                    required
                  />
                  {isChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="animate-spin h-4 w-4 text-zinc-400"
                        viewBox="0 0 24 24"
                      >
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
                    </div>
                  )}
                  {!isChecking && isAvailable === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  3-30 characters, letters, numbers, dashes, and underscores
                  only
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                disabled={isLoading || !username || isAvailable === false}
                className="w-full bg-gradient-to-r from-zinc-100 to-white hover:from-white hover:to-zinc-100 text-black font-medium shadow-lg shadow-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting username...' : 'Continue'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthBackground>
  );
}
