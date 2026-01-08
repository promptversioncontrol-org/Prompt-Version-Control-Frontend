'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Terminal,
  Cpu,
  Zap,
  ShieldCheck,
  Server,
  Layers,
  Activity,
  Globe,
  Code,
  Lock,
  Book,
  ChevronsDown,
  Copy,
  Download,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArchitectureSection } from './architecture-section';
import { Navbar } from '@/shared/components/navbar';
import { Pricing2 } from '@/shared/components/ui/pricing-cards';
import { Button } from '@/shared/components/ui/button';

// --- Typewriter Effect (Stable) ---
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="font-mono text-zinc-300 whitespace-nowrap">
      {displayText}
      <span className="animate-pulse text-white inline-block ml-0.5">_</span>
    </span>
  );
};

export const LandingPage = () => {
  // --- Animation Hooks ---
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // --- Proxy Installer Logic ---
  const [installMethod, setInstallMethod] = useState<'curl' | 'wget'>('curl');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const downloadUrl = `${appUrl}/downloads/PVC_Proxy_Setup_v1.0.exe`;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden relative">
      {/* Background - Clean, Subtle Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[1000px] h-[800px] bg-white/[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32 px-6 text-center max-w-6xl mx-auto min-h-screen flex flex-col justify-center">
        {/* Spinning Logo */}
        <motion.div
          style={{ opacity, scale }}
          className="flex justify-center mb-12 perspective-1000"
        >
          <Image
            src="/icon/logo.svg"
            alt="PVC Logo"
            width={160}
            height={160}
            className="drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] logo-spin-3d grayscale hover:grayscale-0 transition-all duration-700"
          />
        </motion.div>

        {/* Terminal Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto mb-8 bg-black/50 border border-zinc-800 rounded-full px-5 py-2 flex items-center gap-4 w-fit max-w-[90vw] backdrop-blur-md shadow-lg shadow-zinc-900/50"
        >
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 border border-zinc-400" />
          </div>
          <div className="text-xs sm:text-sm text-zinc-500 font-mono flex items-center gap-2 border-l border-zinc-800 pl-4 overflow-x-auto no-scrollbar">
            <span className="text-zinc-600 shrink-0">$</span>
            <TypewriterText text="npm install -g @adam903/pvc" />
          </div>
        </motion.div>

        <motion.h1
          style={{ scale }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-600 leading-[1.1]"
        >
          The Firewall for <br />
          <span className="text-white">Artificial Intelligence</span>
        </motion.h1>

        <motion.p
          style={{ opacity }}
          className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Stop sensitive data leaks before they leave your terminal. Real-time
          observability and policy enforcement.
        </motion.p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          <Link
            href="/sign-up"
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden hover:bg-zinc-200 transition-colors"
          >
            <span className="relative flex items-center gap-2">
              Start Protecting{' '}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </Link>

          <Link
            href="/docs"
            className="px-8 py-4 bg-black border border-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Book size={18} className="text-zinc-500" />
            Documentation
          </Link>

          <Link
            href="/demo"
            className="px-8 py-4 bg-black border border-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Terminal size={18} className="text-zinc-500" />
            Live Demo
          </Link>
        </div>

        {/* 3D Tilt Card - Dashboard Preview */}
        <TiltCard>
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_-10px_rgba(255,255,255,0.05)] bg-black mx-auto max-w-full">
            {/* Fake UI Header */}
            <div className="h-8 md:h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-3 md:px-4 justify-between">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="text-[10px] md:text-xs text-zinc-600 font-mono truncate ml-2">
                dashboard.pvc.dev
              </div>
            </div>

            {/* Fake UI Content */}
            <div className="flex flex-col md:grid md:grid-cols-12 gap-px bg-zinc-800/50">
              {/* Sidebar - Hidden on Mobile */}
              <div className="hidden md:block md:col-span-3 bg-black p-6 space-y-6">
                <div className="space-y-2">
                  <div className="h-2 w-12 bg-zinc-900 rounded" />
                  <div className="h-2 w-20 bg-zinc-900 rounded" />
                </div>
                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3 text-zinc-400 text-sm">
                    <Activity size={14} /> Activity
                  </div>
                  <div className="flex items-center gap-3 text-white text-sm bg-zinc-900 border border-zinc-800 p-2 rounded">
                    <ShieldCheck size={14} className="text-white" /> Policies
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 text-sm">
                    <Layers size={14} /> Integrations
                  </div>
                </div>
              </div>

              {/* Main Content - Full Width on Mobile */}
              <div className="w-full md:col-span-9 bg-black p-4 md:p-8">
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <div>
                    <div className="text-xs md:text-sm text-zinc-500 mb-1">
                      Threats Blocked (24h)
                    </div>
                    <div className="text-3xl md:text-4xl font-mono text-white">
                      1,248
                    </div>
                  </div>

                  <div className="h-8 md:h-9 px-3 md:px-4 rounded border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-500 text-[10px] md:text-xs font-mono">
                    System Stable
                  </div>
                </div>

                {/* Abstract Graph */}
                <div className="h-32 md:h-48 flex items-end gap-1 md:gap-2 pb-4 border-b border-zinc-800">
                  {[40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-700 transition-colors rounded-t-sm relative group border-t border-zinc-800"
                        style={{ height: `${h}%` }}
                      ></div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* Marquee Section */}
      <section className="py-10 border-y border-zinc-800 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
            Trusted by engineering teams at
          </span>
        </div>
        <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
          {[
            'Acme Corp',
            'Globex',
            'Soylent',
            'Initech',
            'Umbrella',
            'Cyberdyne',
            'Massive Dynamic',
          ].map((company, i) => (
            <div
              key={i}
              className="text-xl font-bold text-zinc-300 flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-zinc-800 rounded-full" /> {company}
            </div>
          ))}
          {[
            'Acme Corp',
            'Globex',
            'Soylent',
            'Initech',
            'Umbrella',
            'Cyberdyne',
            'Massive Dynamic',
          ].map((company, i) => (
            <div
              key={`dup-${i}`}
              className="text-xl font-bold text-zinc-300 flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-zinc-800 rounded-full" /> {company}
            </div>
          ))}
        </div>
      </section>

      <ArchitectureSection />

      {/* --- PVC PROXY INSTALLER SECTION (Merged from feature/docs) --- */}
      <section
        id="proxy"
        className="py-24 relative z-10 border-t border-zinc-900"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-black/50 backdrop-blur-md mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-zinc-300">
                Latest Release: v1.0.0
              </span>
            </div>

            <h2 className="text-5xl font-black tracking-tighter text-white">
              PVC Proxy
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Secure, observable, and policy-compliant AI request handling for
              your entire organization.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-6">
            <a href="/downloads/PVC_Proxy_Setup_v1.0.exe" download>
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105 group border-0 font-semibold"
              >
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Download Windows Installer
              </Button>
            </a>
          </div>

          {/* CLI Install Box */}
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center justify-center gap-6 mb-3 text-xs font-mono">
              <button
                onClick={() => setInstallMethod('curl')}
                className={`transition-colors ${
                  installMethod === 'curl'
                    ? 'text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setInstallMethod('wget')}
                className={`transition-colors ${
                  installMethod === 'wget'
                    ? 'text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                wget
              </button>
            </div>

            <div className="relative group mx-auto bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm text-left flex items-center justify-between hover:border-zinc-700 transition-colors backdrop-blur-md">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-none text-zinc-300 pr-8">
                {installMethod === 'curl' ? (
                  <>
                    <span className="text-purple-400">curl</span> -O{' '}
                    {downloadUrl}
                  </>
                ) : (
                  <>
                    <span className="text-yellow-400">wget</span> {downloadUrl}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  const cmd =
                    installMethod === 'curl'
                      ? `curl -O ${downloadUrl}`
                      : `wget ${downloadUrl}`;
                  navigator.clipboard.writeText(cmd);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100"
                title="Copy command"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Proxy Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto text-left">
            {[
              {
                icon: ShieldCheck,
                title: 'Enterprise Security',
                desc: 'Bank-grade encryption and policy enforcement for all AI traffic.',
              },
              {
                icon: Server,
                title: 'Local Processing',
                desc: 'Run a local proxy server that intercepts and audits prompts in real-time.',
              },
              {
                icon: ChevronsDown,
                title: 'Zero Latency',
                desc: 'Optimized Rust-based core ensures minimal impact on request times.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors"
              >
                <feature.icon className="h-8 w-8 text-zinc-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid (Bento) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Defense in Depth
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            A complete security suite designed for the generative AI era.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          <BentoCard className="md:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="p-8">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 text-white">
                  <Code size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Hybrid Analysis Engine
                </h3>
                <p className="text-zinc-400 max-w-sm">
                  Switch between Cloud and Local (OSS) analysis models
                  instantly. Keep your PII on-premise.
                </p>
              </div>
              <div className="px-8 pb-8">
                <div className="bg-black border border-zinc-800 rounded-lg p-5 font-mono text-xs text-zinc-400 shadow-xl">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                    <span>engine_config.json</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-500">Live</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div>
                      &quot;mode&quot;:{' '}
                      <span className="text-white">
                        &quot;local_strict&quot;
                      </span>
                      ,
                    </div>
                    <div>
                      &quot;model&quot;:{' '}
                      <span className="text-white">
                        &quot;pvc-nano-v2&quot;
                      </span>
                      ,
                    </div>
                    <div>
                      &quot;latency_budget&quot;:{' '}
                      <span className="text-white">&quot;20ms&quot;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:row-span-2">
            <div className="p-8 h-full flex flex-col">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 text-white">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Global Edge
              </h3>
              <p className="text-zinc-400 mb-8">
                Deployed across 35 regions for sub-10ms latency overhead.
              </p>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)]" />
                <div className="grid grid-cols-4 gap-4 opacity-20 mt-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-full bg-zinc-600 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 text-white">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Zero Friction
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Drop-in replacement for OpenAI SDKs. Change one line of code and
                you are protected.
              </p>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6 text-white">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                PII Redaction
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Automatically detect and mask emails, keys, and credit cards
                before they leave localhost.
              </p>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-zinc-900 bg-black" id="pricing">
        <Pricing2
          heading="Transparent Pricing"
          description="Start for free, scale with security."
          plans={[
            {
              id: 'starter',
              name: 'Developer',
              description: 'For individuals building locally.',
              monthlyPrice: '$0',
              yearlyPrice: '$0',
              features: [
                { text: 'Local Proxy' },
                { text: 'Basic Pattern Matching' },
                { text: '3 Days Retention' },
              ],
              button: { text: 'Install CLI', url: '/docs' },
            },
            {
              id: 'pro',
              name: 'Team',
              description: 'For startups and small teams.',
              monthlyPrice: '$49',
              yearlyPrice: '$39',
              features: [
                { text: 'Unified Dashboard' },
                { text: 'Custom Policies' },
                { text: 'Slack Alerts' },
                { text: '30 Days Retention' },
              ],
              button: { text: 'Start Trial', url: '/signup' },
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              description: 'For compliance-focused organizations.',
              monthlyPrice: 'Custom',
              yearlyPrice: 'Custom',
              features: [
                { text: 'SSO / SAML' },
                { text: 'VPC Peering' },
                { text: 'Audit Logs API' },
                { text: 'Dedicated Support' },
              ],
              button: { text: 'Contact Sales', url: '/contact' },
            },
          ]}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-8 opacity-50 hover:opacity-100 transition-opacity">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            width={24}
            height={24}
            className="grayscale"
          />
          <span className="font-bold text-white">PVC</span>
        </div>
        <div className="text-zinc-600 text-sm">
          &copy; 2025 Prompt Version Control Inc.
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- Helper Components ---

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useTransform(useScroll().scrollY, [0, 500], [0, 5]);
  return (
    <motion.div
      style={{ rotateX: x }}
      className="perspective-1000 transform-gpu transition-all duration-500 hover:scale-[1.01]"
    >
      {children}
    </motion.div>
  );
};

const BentoCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-black border border-zinc-800 rounded-3xl hover:border-zinc-600 transition-colors backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);
