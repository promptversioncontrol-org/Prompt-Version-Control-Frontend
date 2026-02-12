import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4  bg-[size:24px_24px]">
      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-900/20 blur-[100px] pointer-events-none" />

      <Card className="max-w-[480px] w-full bg-zinc-950/70 border-zinc-800 p-8 md:p-10 shadow-2xl backdrop-blur-xl relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        {/* Top Highlight Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <div className="flex flex-col items-center text-center">
          {/* Icon Wrapper with Neon Glow */}
          <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-all duration-500" />
            <div className="relative w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shadow-inner ring-1 ring-red-500/20 group-hover:scale-105 transition-transform duration-300">
              <X className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Payment Cancelled
          </h1>

          <p className="text-zinc-400 text-lg mb-8 max-w-sm">
            No worries, you haven&apos;t been charged. The transaction was
            cancelled successfully.
          </p>

          <div className="w-full bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-8">
            <p className="text-sm text-red-300/80">
              If you encountered an error during checkout, please try again or
              contact support.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button
              asChild
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              <Link href="/dashboard/billing">Try Again</Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            >
              <Link href="/dashboard/billing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
