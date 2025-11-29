'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignUpSchema,
  type SignUpDto,
} from '@/features/auth/contracts/auth.dto';
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
import { Separator } from '@/shared/components/ui/separator';
import {
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  ArrowRight,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { signIn, signUp } from '@/shared/lib/auth-client';
import { setupUserFolder } from '../services/setup-new-user';
import { AuthBackground } from '@/shared/components/ui/auth-background';

export default function SignupCardSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpDto>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpDto) => {
    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await signUp.email(
      { name: data.name, email: data.email, password: data.password },
      {
        onRequest: () => console.log('Creating account...'),
        onSuccess: async (ctx) => {
          console.log('Registered');
          if (ctx.data?.user?.id) {
            try {
              await setupUserFolder(ctx.data.user.id);
            } catch (err) {
              console.error('Failed to setup user folder', err);
            }
          }
          setSuccess(true);
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? 'An error occurred during sign up');
        },
      },
    );

    if (signUpError) {
      setError(signUpError.message ?? 'An error occurred');
    }

    setIsLoading(false);
  };

  const handleGithubSignUp = async () => {
    setIsLoading(true);
    setError(null);

    await signIn.social(
      {
        provider: 'github',
        callbackURL: '/setup-username',
      },
      {
        onRequest: () => {
          console.log('Redirecting to GitHub...');
        },
        onSuccess: async (ctx) => {
          console.log('Successfully signed in!', ctx);

          if (ctx.data?.user?.id) {
            try {
              // Wywołaj Server Action
              const result = await setupUserFolder(ctx.data.user.id);

              if (result.success) {
                console.log('S3 folder created:', result.data);
              } else {
                console.error('Failed to create S3 folder:', result.error);
                setError('Account created but workspace setup failed');
              }
            } catch (error) {
              console.error('Failed to setup folder:', error);
              setError('Account created but workspace setup failed');
            }
          }
        },
        onError: (ctx) => {
          console.error('Sign in failed:', ctx.error);
          setError(ctx.error.message || 'Unable to sign up with GitHub');
        },
      },
    );

    setIsLoading(false);
  };
  if (success) {
    return (
      <AuthBackground>
        <div className="h-full w-full flex flex-col items-center justify-center px-4 flex-grow">
          <Card className="card-animate w-full max-w-md border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
            <CardHeader className="space-y-1">
              <div className="rounded-full bg-green-500/10 p-3 w-fit mx-auto mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">
                Check your email
              </CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                We&apos;ve sent you a verification link. Please check your inbox
                to complete your registration.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={() => setSuccess(false)}
                className="w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
              >
                Back to Sign Up
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      {/* Centered Signup Card */}
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
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-300 label-animate">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="peer pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                    {...register('name')}
                  />
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-zinc-300" />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

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
                <p className="text-xs text-zinc-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="glow-button w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full loading-spinner mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
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
              onClick={handleGithubSignUp}
              variant="outline"
              className="github-button w-full h-10 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50"
            >
              <Github className="h-4 w-4 mr-2" />
              Sign up with GitHub
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-zinc-400">
            Already have an account?
            <a
              className="ml-1 text-zinc-200 hover:underline transition-all hover:text-white"
              href="/sign-in"
            >
              Sign in
            </a>
          </CardFooter>
        </Card>
      </div>
    </AuthBackground>
  );
}
