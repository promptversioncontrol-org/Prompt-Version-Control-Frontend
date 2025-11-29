'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  SignInSchema,
  type SignInDto,
} from '@/features/auth/contracts/auth.dto';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { Eye, EyeOff, Github, Lock, Mail, ArrowRight } from 'lucide-react';
import { signIn } from '@/shared/lib/auth-client';

import { AuthBackground } from '@/shared/components/ui/auth-background';

export default function LoginCardSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInDto>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInDto) => {
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn.email(
      { email: data.email, password: data.password },
      {
        onRequest: () => console.log('Signing in...'),
        onSuccess: () => console.log('Signed in'),
        onError: (ctx) => setError(ctx.error.message ?? 'An error occurred'),
      },
    );

    if (signInError) {
      setError(signInError.message ?? 'An error occurred');
    }

    setIsLoading(false);
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: socialError } = await signIn.social({
        provider: 'github',
      });
      if (socialError) {
        setError(socialError.message);
      }
    } catch {
      setError('Unable to sign in with GitHub.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      {/* Centered Login Card */}
      <div className="h-full w-full flex flex-col items-center justify-center px-4 flex-grow">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            {/* Logo w SVG - białe */}
            <Image
              src="/icon/logo.svg"
              alt="PVC Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              PVC
            </h1>
            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">
              Prompt Version Control
            </p>
          </div>
        </div>

        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
          <CardContent className="grid gap-5 pt-6">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300 label-animate">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="peer pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                    {...register('email')}
                  />
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-zinc-300" />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-zinc-300 label-animate"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    className="peer pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                    {...register('password')}
                  />
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-zinc-300" />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200 transition-all hover:scale-110"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    className="border-zinc-700 data-[state=checked]:bg-zinc-50 data-[state=checked]:text-zinc-900 transition-all"
                    onCheckedChange={() => {
                      // Manually handle checkbox if needed or register it
                      // For now, just keeping UI consistent, or register 'rememberMe'
                    }}
                    {...register('rememberMe')}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="glow-button w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full loading-spinner mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-zinc-800" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] uppercase tracking-widest text-zinc-500">
                or
              </span>
            </div>

            <Button
              type="button"
              onClick={handleGithubSignIn}
              variant="outline"
              className="github-button w-full h-10 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50"
            >
              <Github className="h-4 w-4 mr-2" />
              Continue with GitHub
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-zinc-400">
            Don&apos;t have an account?
            <a
              className="ml-1 text-zinc-200 hover:underline transition-all hover:text-white"
              href="/sign-up"
            >
              Create one
            </a>
          </CardFooter>
        </Card>
      </div>
    </AuthBackground>
  );
}
