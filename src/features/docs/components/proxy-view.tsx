'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Server,
  FileWarning,
  Zap,
  FileCode,
  Activity,
  CheckCircle2,
  Copy,
  Download,
  Monitor,
  Apple,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/features/landingpage/components/navbar';
import { Button } from '@/shared/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'; // Assuming you have shadcn tabs

// --- Components ---

// Reusing SpotlightCard from LandingPage logic for consistency
const SpotlightCard = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
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

const LiveLogTerminal = () => {
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Proxy initialized on port 6767',
    '[INFO] Loaded 12 rules from pvc.rules',
  ]);

  useEffect(() => {
    const newLogs = [
      '[REQ] POST https://api.openai.com/v1/chat/completions',
      '[SCAN] Analyzing 2.4kb payload...',
      '[WARN] Detected API_KEY pattern in messages[1].content',
      '[ACTION] Sanitized 1 sensitive item',
      '[RES] 200 OK - Forwarded to upstream (18ms)',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < newLogs.length) {
        setLogs((prev) => [...prev, newLogs[i]].slice(-6)); // Keep last 6 lines
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-xs overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-zinc-500 ml-2">pvc-proxy.log — tail -f</span>
      </div>
      <div className="space-y-1.5 h-[140px] flex flex-col justify-end">
        {logs.filter(Boolean).map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${log?.includes('[WARN]') ? 'text-amber-400' : log?.includes('[ACTION]') ? 'text-emerald-400' : 'text-zinc-400'}`}
          >
            <span className="opacity-30 mr-2 border-r border-white/10 pr-2">
              {new Date().toLocaleTimeString().split(' ')[0]}
            </span>
            {log}
          </motion.div>
        ))}
        <div className="animate-pulse bg-zinc-600 w-2 h-4" />
      </div>
    </div>
  );
};

const FlowStep = ({
  icon: Icon,
  title,
  desc,
  delay,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative z-10 flex flex-col items-center text-center max-w-[280px]"
  >
    <div
      className={`w-20 h-20 rounded-3xl ${color} flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_currentColor] border border-white/10 relative group bg-black/40 backdrop-blur-md`}
    >
      <Icon className="w-8 h-8 text-white relative z-10" />
      <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
  </motion.div>
);

export function ProxyView() {
  // Fallback to localhost if env var is not set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const downloads = {
    windows: `${appUrl}/downloads/PVC_Proxy_Setup_v1.0.exe`,
    mac: `${appUrl}/downloads/PVC_Proxy_v1.0.dmg`, // Placeholder
    linux: `${appUrl}/downloads/pvc-proxy-linux-v1.0.tar.gz`, // Placeholder
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden relative">
      {/* Background Ambient Noise/Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-zinc-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Architecture Deep Dive
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
            >
              The Invisible <br /> Firewall.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 leading-relaxed max-w-lg"
            >
              PVC Proxy sits between your local environment and the cloud. It
              intercepts, inspects, and sanitizes every packet in{' '}
              <span className="text-white font-semibold">under 20ms</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 text-sm font-mono text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Rust Core
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> TLS 1.3
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{' '}
                Zero-Config
              </div>
            </motion.div>
          </div>

          {/* Hero Visual: Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative perspective-1000"
          >
            {/* Floating elements behind */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl" />

            <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
              <LiveLogTerminal />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- INSTALLATION SECTION (REDESIGNED) --- */}
      <section className="relative z-10 py-20 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Get Started in Seconds
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Download the binary for your platform or install via your favorite
              package manager.
            </p>
          </div>

          <Tabs defaultValue="windows" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border border-white/10 rounded-xl p-1 mb-8">
              <TabsTrigger
                value="windows"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <Monitor className="w-4 h-4 mr-2" /> Windows
              </TabsTrigger>
              <TabsTrigger
                value="mac"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <Apple className="w-4 h-4 mr-2" /> macOS
              </TabsTrigger>
              <TabsTrigger
                value="linux"
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <TerminalIcon className="w-4 h-4 mr-2" /> Linux
              </TabsTrigger>
            </TabsList>

            {/* Windows Content */}
            <TabsContent
              value="windows"
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Windows Installer (x64)
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Recommended for Windows 10/11
                      </p>
                    </div>
                  </div>
                </div>
                <a href={downloads.windows} download>
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-zinc-200 min-w-[200px]"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download .exe
                  </Button>
                </a>
              </div>

              {/* CLI Option */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-3 text-xs font-mono text-zinc-500">
                  <span>OR INSTALL VIA POWERSHELL</span>
                </div>
                <div className="relative group bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm text-left flex items-center justify-between hover:border-zinc-700 transition-colors">
                  <code className="text-zinc-300">
                    <span className="text-blue-400">irm</span> {appUrl}
                    /install.ps1 | <span className="text-yellow-400">iex</span>
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `irm ${appUrl}/install.ps1 | iex`,
                      )
                    }
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* macOS Content */}
            <TabsContent
              value="mac"
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-500/20 rounded-lg text-white">
                      <Apple className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        macOS Binary (Universal)
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Supports Apple Silicon (M1/M2) & Intel
                      </p>
                    </div>
                  </div>
                </div>
                <a href={downloads.mac} download>
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-zinc-200 min-w-[200px]"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download .dmg
                  </Button>
                </a>
              </div>

              {/* CLI Option */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-3 text-xs font-mono text-zinc-500">
                  <span>OR INSTALL VIA HOMEBREW</span>
                </div>
                <div className="relative group bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm text-left flex items-center justify-between hover:border-zinc-700 transition-colors">
                  <code className="text-zinc-300">
                    <span className="text-green-400">brew</span> install
                    pvc-proxy
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(`brew install pvc-proxy`)
                    }
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* Linux Content */}
            <TabsContent
              value="linux"
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                      <TerminalIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Linux Tarball
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Debian, Ubuntu, Fedora, Arch
                      </p>
                    </div>
                  </div>
                </div>
                <a href={downloads.linux} download>
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-zinc-200 min-w-[200px]"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download .tar.gz
                  </Button>
                </a>
              </div>

              {/* CLI Option */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-3 text-xs font-mono text-zinc-500">
                  <span>OR INSTALL VIA CURL</span>
                </div>
                <div className="relative group bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm text-left flex items-center justify-between hover:border-zinc-700 transition-colors">
                  <code className="text-zinc-300">
                    <span className="text-purple-400">curl</span> -fsSL {appUrl}
                    /install.sh | sh
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `curl -fsSL ${appUrl}/install.sh | sh`,
                      )
                    }
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* --- CORE LOGIC FLOW --- */}
      <section className="relative py-32 border-y border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[40px] left-[140px] right-[140px] h-[1px] bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/3 animate-[shimmer_3s_infinite]" />
            </div>

            <FlowStep
              icon={Server}
              title="1. Interception"
              desc="Local mitmproxy on port 6767 catches outgoing HTTPS requests using a self-signed CA certificate."
              delay={0.1}
              color="text-blue-400 border-blue-500/20"
            />

            <FlowStep
              icon={Search}
              title="2. Inspection"
              desc="The recursive parser scans JSON payloads for sensitive patterns (API keys, PII) defined in your policy."
              delay={0.3}
              color="text-purple-400 border-purple-500/20"
            />

            <FlowStep
              icon={Shield}
              title="3. Enforcement"
              desc="Sensitive data is redacted in-flight. The modified request is then re-encrypted and sent to the LLM."
              delay={0.5}
              color="text-emerald-400 border-emerald-500/20"
            />
          </div>
        </div>
        <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
         `}</style>
      </section>

      {/* --- TECHNICAL DEEP DIVE --- */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-24 relative z-10">
        {/* Feature 1: Censor Logic */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileWarning className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold">The Censor Waterfall</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              To minimize false positives, the logic engine applies rules in a
              strict priority order. Files are checked before content, and
              specific regex patterns override generic ones.
            </p>

            <ul className="space-y-3 mt-4">
              {[
                { label: 'Level 1', text: 'Restricted Paths & Directories' },
                { label: 'Level 2', text: 'File Extensions (.env, .pem)' },
                { label: 'Level 3', text: 'Semantic PII Analysis' },
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Snippet */}
          <SpotlightCard className="p-0 overflow-hidden !bg-black/50">
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="ml-3 text-xs text-zinc-500 font-mono">
                censor_engine.py
              </span>
            </div>
            <div className="p-6 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
              <span className="text-purple-400">def</span>{' '}
              <span className="text-blue-400">censor_text</span>(text):
              <br />
              &nbsp;&nbsp;
              <span className="text-zinc-500">
                # Priority 1: Check absolute paths
              </span>
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">if</span>{' '}
              <span className="text-yellow-300">is_blocked_path</span>(text):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-purple-400">return</span>{' '}
              <span className="text-green-400">&quot;[BLOCKED_FILE]&quot;</span>
              <br />
              <br />
              &nbsp;&nbsp;
              <span className="text-zinc-500">
                # Priority 2: Regex patterns
              </span>
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">
                for
              </span> pattern <span className="text-purple-400">in</span>{' '}
              PATTERNS:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-purple-400">if</span> pattern.match(text):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;text = pattern.sub(
              <span className="text-green-400">&quot;[REDACTED]&quot;</span>)
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">return</span> text
            </div>
          </SpotlightCard>
        </div>

        {/* Feature 2: Performance */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Visual: Latency Chart */}
          <SpotlightCard className="order-2 md:order-1">
            <h4 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">
              Latency Overhead
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Direct Request</span>
                  <span className="text-zinc-500">140ms</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-zinc-600 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-bold">With PVC Proxy</span>
                  <span className="text-emerald-400 font-bold">
                    158ms (+18ms)
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-600 to-emerald-500 w-[52%]" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4 text-xs text-zinc-500 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Rust Optimization
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Async I/O
              </div>
            </div>
          </SpotlightCard>

          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold">Zero-Latency Impact</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Security shouldn&apos;t slow you down. The proxy is built on a
              highly optimized async core that adds negligible overhead to your
              LLM requests.
            </p>
            <p className="text-zinc-500 text-sm">
              We buffer only the necessary packets for inspection and stream the
              rest, ensuring that the &quot;Time to First Token&quot; (TTFT)
              remains unaffected.
            </p>
          </div>
        </div>
      </div>

      {/* --- FILE STRUCTURE --- */}
      <div className="border-t border-white/10 bg-black/50 py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Core Components</h2>
          <p className="text-zinc-400">
            The essential files that power the local proxy.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'main.py',
              desc: 'Entry point. Handles SSL termination, request routing, and certificate generation.',
            },
            {
              name: 'censor_engine.py',
              desc: 'The brain. Contains text processing logic, regex compilation, and whitelisting.',
            },
            {
              name: 'config.py',
              desc: 'Static configuration. Defines target hosts (OpenAI, Anthropic) and port settings.',
            },
          ].map((file) => (
            <SpotlightCard key={file.name} className="text-left group !p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileCode className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                <span className="font-mono text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {file.name}
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {file.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm relative z-10 bg-black">
        <p>
          &copy; {new Date().getFullYear()} PVC. Built for the safe AI future.
        </p>
      </footer>
    </div>
  );
}
