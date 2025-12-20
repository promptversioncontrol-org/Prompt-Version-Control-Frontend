import { Separator } from '@/shared/components/ui/separator';
import { DocsPageTransition } from '@/features/docs/components/docs-page-transition';
import { CodeBlock } from '@/features/docs/components/code-block';
import { ChevronRight } from 'lucide-react'; // Ikona do sekcji kroków

export default function DocsPage() {
  return (
    <DocsPageTransition>
      <div className="space-y-16 pb-24">
        {/* Introduction */}
        <section id="introduction" className="space-y-6">
          {/* Nagłówek ze srebrnym gradientem */}
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Prompt Version Control (PVC)
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed max-w-2xl">
            Total observability for your AI workflow. Monitor prompts, detect
            leaks, and enforce policies across your entire organization.
          </p>
          {/* Przyciski "call to action" w stylu szklanym */}
          <div className="flex gap-4 pt-4">
            <a
              href="#installation"
              className="px-6 py-2.5 rounded-lg bg-white text-black font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/promptversioncontrol-org"
              target="_blank"
              className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 text-white font-medium hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-md"
            >
              View on GitHub
            </a>
          </div>
        </section>

        <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />

        {/* Installation - Stylizowana sekcja kroków */}
        <section id="installation" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Getting Started
            </h2>
            <p className="text-zinc-400 text-lg">
              Start tracking your prompts in seconds.
            </p>
          </div>

          {/* Wizualizacja kroków */}
          <div className="relative border-l border-white/10 pl-8 ml-4 space-y-10">
            {/* Krok 1 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/30 shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)] text-sm font-bold text-white">
                1
              </span>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                Installation
              </h3>
              <p className="text-zinc-400 mb-4">
                Install the PVC CLI globally via npm.
              </p>
              <CodeBlock code="npm install -g @pvc/cli" title="Terminal" />
            </div>
            {/* Krok 2 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/30 shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)] text-sm font-bold text-white">
                2
              </span>
              <h3 className="text-xl font-semibold text-white mb-3">
                Initialize PVC
              </h3>
              <p className="text-zinc-400 mb-4">
                Run the init command in your project root.
              </p>
              <CodeBlock code="pvc init" title="Terminal" />
            </div>
          </div>
        </section>

        <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />

        {/* Configuration */}
        <section id="configuration" className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Configuration</h2>
          <p className="text-zinc-400 text-lg">
            PVC uses a global configuration to manage sessions and remotes. You
            typically don&apos;t edit this manually; use the CLI commands below.
          </p>
        </section>

        <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />

        <div className="space-y-16">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 inline-block border-b-2 border-white/10 pb-2">
            Commands Reference
          </h2>

          {/* init */}
          <section id="init" className="space-y-4 pt-4">
            <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <span className="text-zinc-500">$</span> pvc init
            </h3>
            <p className="text-zinc-400 text-lg">
              Initialize PVC in current directory. This creates the local `.pvc`
              folder.
            </p>
            <CodeBlock code="pvc init" />
          </section>

          {/* update-conv */}
          <section id="update-conv" className="space-y-4 pt-4">
            <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <span className="text-zinc-500">$</span> pvc update-conv
            </h3>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Scans the{' '}
              <code className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-white text-sm font-mono shadow-[0_0_10px_-3px_rgba(255,255,255,0.3)]">
                .codex/sessions
              </code>{' '}
              directory to find the latest session and updates the
              configuration.
            </p>
            <CodeBlock code="pvc update-conv" />
          </section>

          {/* remote */}
          <section id="remote" className="space-y-6 pt-4">
            <div>
              <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3 mb-2">
                <span className="text-zinc-500">$</span> pvc remote
              </h3>
              <p className="text-zinc-400 text-lg">
                Manage remote repository URLs.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/30 transition-colors">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  Add remote
                </h4>
                <CodeBlock code="pvc remote add <url>" language="bash" />
              </div>

              <div className="space-y-3 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/30 transition-colors">
                <h4 className="text-white font-semibold">Show remote</h4>
                <CodeBlock code="pvc remote -v" language="bash" />
              </div>
            </div>
          </section>

          {/* generate */}
          <section id="generate" className="space-y-6 pt-4">
            <div>
              <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3 mb-2">
                <span className="text-zinc-500">$</span> pvc generate
              </h3>
              <p className="text-zinc-400 text-lg">
                Generate a report for a session.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-white font-medium pl-2 border-l-2 border-zinc-500">
                  Generate report for latest session
                </h4>
                <CodeBlock code='pvc generate -m "Report Name"' />
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium pl-2 border-l-2 border-zinc-500">
                  Generate for specific session ID
                </h4>
                <CodeBlock code='pvc generate -id <sessionId> -m "Report Name"' />
              </div>
            </div>
          </section>

          {/* ... (Reszta sekcji: watch, login, push, risk - zastosuj ten sam wzór z CodeBlock i nowymi nagłówkami) ... */}
          <section id="watch" className="space-y-4 pt-4">
            <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <span className="text-zinc-500">$</span> pvc watch
            </h3>
            <p className="text-zinc-400 text-lg">Start background watcher.</p>
            <CodeBlock code="pvc watch" />
            <CodeBlock
              code="pvc watch --session=<id>"
              title="Watch specific session"
            />
          </section>

          <section id="risk" className="space-y-4 pt-4">
            <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <span className="text-zinc-500">$</span> pvc risk
            </h3>
            <p className="text-zinc-400 text-lg">
              Scan prompts or files for sensitive data.
            </p>
            <CodeBlock code='pvc risk scan-prompt "text..."' />
          </section>
        </div>
      </div>
    </DocsPageTransition>
  );
}
