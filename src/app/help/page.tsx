import {
  HelpSearch,
  HelpTopicsGrid,
  TeamGrid,
  FAQSection,
} from '@/features/support/components/help-center';
import { SystemStatus } from '@/features/support/components/system-status';
import { TerminalHero } from '@/features/support/components/terminal-hero';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { MessageCircle, Github, Twitter, Mail } from 'lucide-react';

import { Navbar } from '@/shared/components/navbar';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative border-b border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Support Team Online
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
              How can we help?
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Search our documentation, browse common topics, or get in touch
              with our engineering team directly.
            </p>
          </div>

          <div className="space-y-12">
            <HelpSearch />
            <TerminalHero />
          </div>
        </div>
      </div>

      {/* --- TOPICS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800/50">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
          <SystemStatus />

          <h2 className="text-2xl font-bold text-white mb-2">
            Browse by Topic
          </h2>
          <p className="text-zinc-400">
            Find guides and tutorials for specific features.
          </p>
        </div>
        <HelpTopicsGrid />
      </div>

      {/* --- MEET THE TEAM --- */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800/50">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Meet the Engineers
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Our support is not outsourced. You&apos;ll be talking directly to
              the engineers who built the platform. Whether it&apos;s a complex
              integration issue or a simple question, we&apos;re here to help.
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="h-11 bg-white text-black hover:bg-zinc-200"
              >
                <Link href="mailto:support@mail.adampukaluk.pl">
                  <Mail className="w-4 h-4 mr-2" /> Contact Us
                </Link>
              </Button>
            </div>
          </div>

          <TeamGrid />
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400">
            Quick answers to common questions about billing and account
            management.
          </p>
        </div>
        <FAQSection />
      </div>

      {/* --- COMMUNITY CALLOUT --- */}
      <div className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Join the Community
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <a
              href="#"
              className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <MessageCircle className="w-8 h-8 text-indigo-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Discord</h3>
              <p className="text-sm text-zinc-500">
                Chat with other developers.
              </p>
            </a>
            <a
              href="#"
              className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <Github className="w-8 h-8 text-white mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">GitHub</h3>
              <p className="text-sm text-zinc-500">Report bugs & contribute.</p>
            </a>
            <a
              href="#"
              className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <Twitter className="w-8 h-8 text-sky-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Twitter</h3>
              <p className="text-sm text-zinc-500">
                Follow for latest updates.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
