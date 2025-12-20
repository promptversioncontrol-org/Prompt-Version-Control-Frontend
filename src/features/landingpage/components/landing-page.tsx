'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  Users,
  Cpu,
  Terminal,
  ArrowRight,
  Lock,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ArchitectureSection } from './architecture-section';
import { IntegrationCard } from './integration-card';
import { Pricing2 } from '@/shared/components/ui/pricing-cards';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden relative">
      {/* Background Ambient Noise/Gradient (Subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-white opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-gray-500 opacity-[0.05] blur-[100px] rounded-full"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo from public/icon/logo.svg */}
            <Image
              src="/icon/logo.svg"
              alt="PVC"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <span className="font-semibold tracking-tight text-lg">PVC</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#integrations"
              className="hover:text-white transition-colors"
            >
              Integrations
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center"
            >
              Log In
            </Link>
            <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-gray-300 mb-8 hover:border-white/20 transition-colors cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          Now supporting Codex AI Agents
        </div>

        <div className="flex justify-center mb-8 perspective-800">
          <Image
            src="/icon/logo.svg"
            alt="PVC Logo"
            width={180}
            height={180}
            className="drop-shadow-[0_0_35px_rgba(255,255,255,0.3)] logo-spin-3d"
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
        >
          Total Observability for
          <br />
          Your AI Workflow.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The glass wall between your data and external AI. Monitor prompts,
          detect leaks, and enforce policies across your entire organization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <button
            type="button"
            className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Install PVC <ArrowRight size={18} />
          </button>
          <Link
            href="/docs"
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-lg backdrop-blur-md hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Terminal size={18} /> View Documentation
          </Link>
        </motion.div>

        {/* Hero Visual: The "Glass Prism" Dashboard Preview */}
        <div className="relative mx-auto max-w-4xl perspective-1000">
          <motion.div
            initial={{ opacity: 0, rotateX: 20, scale: 0.9 }}
            animate={{ opacity: 1, rotateX: 12, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
            className="relative bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md transform hover:rotate-0 transition-transform duration-700 ease-out p-1"
          >
            {/* Window Controls */}
            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>

            {/* Glass Dashboard UI */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                    Team Risk Score
                  </div>
                  <div className="text-3xl font-mono text-white">
                    98<span className="text-gray-600">/100</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                    Leaks Prevented
                  </div>
                  <div className="text-3xl font-mono text-white">12</div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="col-span-2 bg-white/[0.02] rounded-lg border border-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs text-gray-400">Live Stream</span>
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded">
                    Active
                  </span>
                </div>

                {/* Item 1 */}
                <div className="flex gap-3 items-start opacity-50">
                  <div className="mt-1">
                    <Check size={14} className="text-gray-500" />
                  </div>
                  <div className="text-xs font-mono text-gray-500">
                    Refactor class User...
                  </div>
                </div>

                {/* Item 2 (Blocked) */}
                <div className="flex gap-3 items-center p-2 bg-white/5 border border-white/10 rounded backdrop-blur-sm">
                  <div className="p-1 bg-white text-black rounded">
                    <Lock size={12} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>usr: dev.mike</span>
                      <span>Tool: Codex</span>
                    </div>
                    <div className="text-xs font-mono text-white blur-[2px] hover:blur-0 transition-all cursor-pointer">
                      AWS_SECRET_KEY = &quot;AKIA...&quot;
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-white border border-white/20 px-2 py-1 rounded">
                    BLOCKED
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ArchitectureSection />

      {/* Integrations - "The Ecosystem" */}
      <section
        id="integrations"
        className="py-24 border-t border-white/10 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold mb-4"
            >
              Protecting your team wherever they work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-500"
            >
              Compatible with the tools you already use.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IntegrationCard
              name="Codex AI"
              status="Active"
              icon={<Cpu />}
              active
            />
            <IntegrationCard
              name="Cursor"
              status="Coming Q4"
              icon={<Terminal />}
            />
            <IntegrationCard
              name="Claude CLI"
              status="Planned"
              icon={<Terminal />}
            />
            <IntegrationCard
              name="Antigravity"
              status="Planned"
              icon={<Zap />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-24 px-6 max-w-7xl mx-auto relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: BYOM */}
          <SpotlightCard className="lg:col-span-2" delay={0.1}>
            <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Hybrid Analysis Engine</h3>
            <p className="text-gray-400 mb-6 max-w-lg">
              Don&apos;t want to send your prompts to another cloud for
              verification? Switch to our{' '}
              <strong>Open Source Local Model</strong>. PVC runs the analysis on
              your infrastructure, ensuring zero data egress.
            </p>

            {/* Visual Toggle */}
            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-white/5 max-w-md">
              <div className="text-xs font-mono text-gray-500">
                ANALYSIS_MODE:
              </div>
              <div className="flex bg-white/10 rounded p-1">
                <div className="px-3 py-1 text-xs text-gray-500">Cloud</div>
                <div className="px-3 py-1 text-xs bg-white text-black rounded shadow font-bold">
                  Local (OSS)
                </div>
              </div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <Check size={10} /> Private
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 2: Workspaces */}
          <SpotlightCard delay={0.2}>
            <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center mb-6 border border-white/20">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Team Workspaces</h3>
            <p className="text-gray-400">
              Invite your engineering, legal, and security teams. Segregate
              projects by access level.
            </p>
            <div className="mt-6 flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-700 border border-black flex items-center justify-center text-[10px] text-white"
                >
                  User
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-white text-black border border-black flex items-center justify-center text-[10px] font-bold">
                +5
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 3: Real-time */}
          <SpotlightCard delay={0.3}>
            <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center mb-6 border border-white/20">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Intervention</h3>
            <p className="text-gray-400">
              We don&apos;t just log leaks; we stop them. PVC sits at the
              network layer to block requests before they leave the device.
            </p>
          </SpotlightCard>

          {/* Feature 4: Policy */}
          <SpotlightCard
            className="lg:col-span-2 flex flex-col md:flex-row items-center gap-8"
            delay={0.4}
          >
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">Custom Policy Engine</h3>
              <p className="text-gray-400">
                Define what &quot;Sensitive&quot; means to you. Use Regex,
                Keyword lists, or semantic matching to catch proprietary code or
                customer PII.
              </p>
            </div>
            <div className="w-full md:w-1/3 bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-xs">
              <div className="text-green-400 mb-2">{'// policy.yaml'}</div>
              <div className="text-purple-400">rules:</div>
              <div className="pl-4 text-gray-300">
                - type: <span className="text-white">API_KEY</span>
              </div>
              <div className="pl-4 text-gray-300">
                {' '}
                action: <span className="text-red-400">BLOCK</span>
              </div>
              <div className="pl-4 text-gray-300">
                - type: <span className="text-white">INTERNAL_URL</span>
              </div>
              <div className="pl-4 text-gray-300">
                {' '}
                action: <span className="text-yellow-400">WARN</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <Pricing2
          heading="Transparent Pricing"
          description="Choose how you want to analyze your data."
          plans={[
            {
              id: 'starter',
              name: 'Starter',
              description: 'For individuals and hobbyists.',
              monthlyPrice: '$0',
              yearlyPrice: '$0',
              features: [
                { text: '1 User' },
                { text: 'Basic Pattern Matching (Regex)' },
                { text: '3 Days Log Retention' },
                { text: 'Community Support' },
              ],
              button: {
                text: 'Get Started',
                url: '/sign-up',
              },
            },
            {
              id: 'pro',
              name: 'Pro Team',
              description: 'For teams requiring privacy-first analysis.',
              monthlyPrice: '$39',
              yearlyPrice: '$29',
              features: [
                { text: 'Unlimited Workspaces' },
                { text: 'Nano OSS Model (Local Analysis)' },
                { text: 'Bring Your Own Key (OpenAI/Anthropic)' },
                { text: '30 Days Log Retention' },
                { text: 'Priority Support' },
              ],
              button: {
                text: 'Start Pro Trial',
                url: '/sign-up?plan=pro',
              },
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              description:
                'For large organizations with strict compliance needs.',
              monthlyPrice: 'Custom',
              yearlyPrice: 'Custom',
              features: [
                { text: 'Unlimited Seats' },
                { text: 'Custom Fine-tuned Analysis Models' },
                { text: 'SSO & SAML' },
                { text: 'Audit Logs Export' },
                { text: 'Dedicated Success Manager' },
              ],
              button: {
                text: 'Contact Sales',
                url: '/contact',
              },
            },
          ]}
        />
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm relative z-10 bg-black">
        <div className="flex justify-center gap-6 mb-8">
          <Link href="/docs" className="hover:text-white transition-colors">
            Documentation
          </Link>
          <a
            href="https://github.com/promptversioncontrol-org"
            target="_blank"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
        <p>
          &copy; {new Date().getFullYear()} PVC. Built for the safe AI future.
        </p>
      </footer>
    </div>
  );
};

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const SpotlightCard = ({
  children,
  className = '',
  delay = 0,
}: SpotlightCardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden transition-colors ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
