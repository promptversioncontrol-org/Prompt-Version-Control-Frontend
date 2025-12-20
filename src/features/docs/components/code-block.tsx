'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Kontener: Szklany efekt, srebrna poświata, ciemne tło
    <div className="group relative my-6 rounded-xl border border-white/10 bg-black/40 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all hover:border-white/30 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.2)]">
      {/* Pasek tytułowy terminala */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2.5 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300 tracking-wide">
            {title || language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          // Przycisk kopiowania z efektem "aktywnego neonu" po kliknięciu
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-300',
            copied
              ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white',
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Zawartość kodu */}
      <div className="overflow-x-auto p-4">
        {/* Używamy czcionki mono i srebrno-białego koloru tekstu */}
        <pre className="font-mono text-[13px] leading-relaxed text-zinc-200 selection:bg-white/20 selection:text-white">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
