import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] select-none">
          404
        </h1>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link href="/dashboard" tabIndex={-1}>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-zinc-200 font-semibold px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
          >
            Return Home
          </Button>
        </Link>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-30 animate-pulse" />
    </div>
  );
}
