'use client';
// basic setup for test development
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/shared/lib/auth-client';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { Key, Terminal, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function SSHPage() {
  const { data: session, isPending: isLoading } = useSession();
  const [pubkey, setPubkey] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  async function addKey() {
    if (!pubkey.trim()) {
      setError('Please paste your public SSH key');
      return;
    }

    setError(null);
    setSaving(true);

    const res = await fetch('/api/auth/ssh/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session?.user?.id,
        publicKey: pubkey.trim(),
        name: name.trim() || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Failed to add SSH key');
      return;
    }

    setSuccess(true);
    setPubkey('');
    setName('');

    setTimeout(() => setSuccess(false), 3000);
  }

  if (isLoading) {
    return (
      <section className="fixed inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 bg-black" />
        <div className="h-full w-full grid place-items-center">
          <div className="text-zinc-400 flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Loading session...
          </div>
        </div>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="fixed inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 bg-black" />
        <style jsx global>{`
          @keyframes card-entrance {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .card-animate {
            animation: card-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
        <div className="h-full w-full grid place-items-center px-4">
          <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
            <CardHeader className="space-y-1">
              <div className="rounded-full bg-red-500/10 p-3 w-fit mx-auto mb-2">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                You must be logged in to add SSH keys
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-200">
                <a href="/sign-in" className="flex items-center">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="fixed inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 bg-black" />
        <style jsx global>{`
          @keyframes card-entrance {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .card-animate {
            animation: card-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
        <div className="h-full w-full grid place-items-center px-4">
          <Card className="card-animate w-full max-w-md border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
            <CardHeader className="space-y-1">
              <div className="rounded-full bg-green-500/10 p-3 w-fit mx-auto mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">
                SSH Key Added!
              </CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                Your SSH key has been successfully registered
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={() => setSuccess(false)}
                className="w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
              >
                Add Another Key
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

      <style jsx global>{`
        @keyframes card-entrance {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow:
              0 0 20px rgba(250, 250, 250, 0.1),
              0 0 40px rgba(250, 250, 250, 0.05);
          }
          50% {
            box-shadow:
              0 0 30px rgba(250, 250, 250, 0.2),
              0 0 60px rgba(250, 250, 250, 0.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .card-animate {
          animation: card-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glow-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .glow-button:hover {
          animation: glow-pulse 2s ease-in-out infinite;
          transform: translateY(-2px);
        }

        .glow-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .glow-button:hover::before {
          opacity: 1;
        }

        .input-focus {
          transition: all 0.3s ease;
        }

        .input-focus:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(250, 250, 250, 0.1);
        }

        .label-animate {
          transition: color 0.2s ease;
        }

        .label-animate:has(+ div input:focus),
        .label-animate:has(+ div textarea:focus) {
          color: rgb(250, 250, 250);
        }
      `}</style>

      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-2xl border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
          <CardHeader className="space-y-1">
            <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-2">
              <Key className="h-6 w-6 text-zinc-50" />
            </div>
            <CardTitle className="text-2xl text-white text-center">
              Add SSH Key
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Connected as{' '}
              <span className="text-zinc-200 font-medium">
                {session.user.email}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-300 label-animate">
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Key Name (Optional)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MacBook Pro, Work Laptop, etc."
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 input-focus"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pubkey" className="text-zinc-300 label-animate">
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Public Key
                </span>
              </Label>
              <div className="relative">
                <Textarea
                  id="pubkey"
                  value={pubkey}
                  onChange={(e) => setPubkey(e.target.value)}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@device"
                  className="min-h-[120px] bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 font-mono text-sm input-focus resize-none"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Paste your{' '}
                <code className="bg-zinc-800 px-1 py-0.5 rounded">
                  id_ed25519.pub
                </code>{' '}
                or{' '}
                <code className="bg-zinc-800 px-1 py-0.5 rounded">
                  id_rsa.pub
                </code>{' '}
                content here
              </p>
            </div>

            <Button
              onClick={addKey}
              disabled={saving}
              className="glow-button w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Key...
                </>
              ) : (
                <>
                  Add SSH Key
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-zinc-400 border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              <span>Use this key with:</span>
              <code className="ml-1 bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">
                pvc login --ssh
              </code>
            </div>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
