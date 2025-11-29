'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
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
import { useSession } from '@/shared/lib/auth-client';
import { createUserFolder } from '../services/user-file-structure-service';
import { setupUserFolder } from '../services/setup-new-user';
export default function SignupCardSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session, isPending } = useSession();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener('resize', onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(e.target as HTMLFormElement);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const { error: signUpError } = await signUp.email(
      { name, email, password },
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
      <section className="fixed inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 bg-black" />
        <div className="h-full w-full grid place-items-center px-4">
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
      </section>
    );
  }

  return (
    <section className="fixed inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 bg-black" />

      {/* Centered Signup Card */}
      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              Create account
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Get started with your free account
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-300 label-animate">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="peer pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                  />
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-zinc-300" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300 label-animate">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="peer pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors peer-focus:text-zinc-300" />
                </div>
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    required
                    className="peer pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
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
    </section>
  );
}
