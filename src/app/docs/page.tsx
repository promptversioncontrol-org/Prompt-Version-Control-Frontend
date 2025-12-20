 
import { Separator } from '@/shared/components/ui/separator';
import { DocsPageTransition } from './components/docs-page-transition';

export default function DocsPage() {
  return (
    <DocsPageTransition>
      <div className="space-y-12 pb-20">
        {/* Introduction */}
        <section id="introduction" className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Prompt Version Control (PVC)
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Total observability for your AI workflow. Monitor prompts, detect
            leaks, and enforce policies across your entire organization.
          </p>
        </section>

        <Separator className="bg-white/10" />

        {/* Installation */}
        <section id="installation" className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
          <p className="text-gray-400">
            Initialize PVC in your current directory to start tracking.
          </p>
          <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
            pvc init
          </div>
        </section>

        {/* Configuration */}
        <section id="configuration" className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Configuration</h2>
          <p className="text-gray-400">
            PVC uses a global configuration to manage sessions and remotes. You
            typically don&apos;t edit this manually; use the CLI commands.
          </p>
        </section>

        <Separator className="bg-white/10" />

        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Commands</h2>

          {/* init */}
          <section id="init" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc init
            </h3>
            <p className="text-gray-400">
              Initialize PVC in current directory.
            </p>
          </section>

          {/* update-conv */}
          <section id="update-conv" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc update-conv
            </h3>
            <p className="text-gray-400">
              Scans the{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-white text-xs">
                .codex/sessions
              </code>{' '}
              directory to find the latest session and updates the
              configuration.
            </p>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
              pvc update-conv
            </div>
          </section>

          {/* remote */}
          <section id="remote" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc remote
            </h3>
            <p className="text-gray-400">Manage remote repository URLs.</p>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">Add remote</h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc remote add &lt;url&gt;
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">Show remote</h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc remote -v
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">Remove remote</h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc remote remove
              </div>
            </div>
          </section>

          {/* generate */}
          <section id="generate" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc generate
            </h3>
            <p className="text-gray-400">Generate a report for a session.</p>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">
                Generate report for latest session
              </h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc generate -m &quot;Report Name&quot;
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">
                Generate for specific session ID
              </h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc generate -id &lt;sessionId&gt; -m &quot;Report Name&quot;
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-white font-medium">
                Include last N messages
              </h4>
              <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                pvc generate -m &quot;Report Name&quot; -last 5
              </div>
            </div>
          </section>

          {/* watch */}
          <section id="watch" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc watch
            </h3>
            <p className="text-gray-400">
              Start background watcher (uses lastSessionId by default).
            </p>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
              pvc watch
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 mt-2">
              pvc watch --session=&lt;id&gt;
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 mt-2">
              pvc watch stop
            </div>
          </section>

          {/* login */}
          <section id="login" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc login
            </h3>
            <p className="text-gray-400">
              Log in using SSH key challenge/response.
            </p>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
              pvc login --ssh
            </div>
          </section>

          {/* push */}
          <section id="push" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc push
            </h3>
            <p className="text-gray-400">
              Upload daily reports to remote backend.
            </p>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
              pvc push
            </div>
          </section>

          {/* risk */}
          <section id="risk" className="space-y-3 pt-4">
            <h3 className="text-xl font-medium text-white font-mono">
              pvc risk
            </h3>
            <p className="text-gray-400">
              Scan prompts or files for sensitive data.
            </p>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
              pvc risk scan-prompt &quot;text...&quot;
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 mt-2">
              pvc risk scan-file path/to/file
            </div>
          </section>
        </div>
      </div>
    </DocsPageTransition>
  );
}
