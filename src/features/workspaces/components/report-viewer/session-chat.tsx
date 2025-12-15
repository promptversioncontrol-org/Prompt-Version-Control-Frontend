import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  CodeXml,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ConversationItem } from '../../types/report-viewer.types';
import { Button } from '@/shared/components/ui/button';

interface SessionChatProps {
  conversation: ConversationItem[];
}

const CodeBlock = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, '');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-800 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="text-xs text-zinc-500 font-mono">Code</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-white"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
        <code className={className}>{children}</code>
      </div>
    </div>
  );
};

const MessageBubble = ({ item }: { item: ConversationItem }) => {
  const isUser = item.role === 'user';
  // const isAssistant = item.role === 'assistant';
  const isReasoning = item.role === 'reasoning';
  const [expanded, setExpanded] = useState(!isReasoning);
  const [contextExpanded, setContextExpanded] = useState(false);

  if (isReasoning) {
    return (
      <div className="mb-4 px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors w-full p-2 rounded hover:bg-zinc-900/50"
        >
          <BrainCircuit
            size={14}
            className={expanded ? 'text-indigo-400' : 'text-zinc-600'}
          />
          <span>Chain of Thought Process</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pl-4 border-l-2 border-indigo-500/20 text-sm text-zinc-400 font-mono italic">
                {item.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Parse IDE Context
  let messageContent = item.text;
  let ideContext = '';

  if (isUser) {
    const contextMatch = item.text.match(
      /Context from my IDE setup:([\s\S]*?)My request for Codex:/i,
    );
    if (contextMatch) {
      ideContext = contextMatch[1].trim();
      messageContent = item.text.replace(contextMatch[0], '').trim();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4 mb-8',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1',
          isUser
            ? 'bg-zinc-800 border-zinc-700'
            : 'bg-emerald-500/10 border-emerald-500/20',
        )}
      >
        {isUser ? (
          <User size={16} className="text-zinc-400" />
        ) : (
          <Bot size={16} className="text-emerald-500" />
        )}
      </div>

      <div
        className={cn(
          'flex-1 min-w-0 max-w-[85%]',
          isUser ? 'items-end flex flex-col' : '',
        )}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-zinc-500">
            {isUser ? 'You' : 'Model'}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">
            {new Date(item.tsMs).toLocaleTimeString()}
          </span>
        </div>

        {/* IDE Context Display */}
        {ideContext && (
          <div className="mb-2 max-w-full">
            <button
              onClick={() => setContextExpanded(!contextExpanded)}
              className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900/30 border border-zinc-800/50 rounded-md px-2 py-1"
            >
              <CodeXml size={10} />
              <span>IDE Context Provided</span>
              {contextExpanded ? (
                <ChevronDown size={10} />
              ) : (
                <ChevronRight size={10} />
              )}
            </button>
            <AnimatePresence>
              {contextExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-zinc-950/50 border border-zinc-800 rounded-md text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre">
                    {ideContext}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div
          className={cn(
            'rounded-2xl p-4 text-sm leading-7 shadow-sm border',
            isUser
              ? 'bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tr-sm'
              : 'bg-[#09090b] border-zinc-800/60 text-zinc-300 rounded-tl-sm',
          )}
        >
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !String(children).includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-400"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return <CodeBlock className={className}>{children}</CodeBlock>;
              },
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>
              ),
            }}
          >
            {messageContent}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

const StackedReasoning = ({ items }: { items: ConversationItem[] }) => {
  const [expanded, setExpanded] = useState(false);
  const count = items.length;

  return (
    <div className="mb-4 px-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors w-full p-2 rounded hover:bg-zinc-900/50 group"
      >
        <div className="relative">
          <BrainCircuit
            size={14}
            className={
              expanded
                ? 'text-indigo-400'
                : 'text-zinc-600 group-hover:text-indigo-400'
            }
          />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
        <span>{count} Reasoning Steps Stacked</span>
        <div className="flex-1 h-[1px] bg-zinc-800 mx-2" />
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2 mt-2"
          >
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="pl-4 border-l-2 border-indigo-500/20 text-sm text-zinc-400 font-mono italic"
              >
                <span className="text-[10px] text-zinc-600 mr-2">
                  Step {idx + 1}:
                </span>
                {item.text}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function SessionChat({ conversation }: SessionChatProps) {
  if (!conversation.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
        <Bot size={48} className="mb-4 opacity-20" />
        <p>No conversation events found in this session.</p>
      </div>
    );
  }

  // Group consecutive reasoning items
  const renderedItems: React.ReactNode[] = [];
  let reasoningGroup: ConversationItem[] = [];

  const flushReasoning = () => {
    if (reasoningGroup.length === 0) return;

    // Only group if there are MORE than 5 items
    if (reasoningGroup.length >= 2) {
      // Use the key of the first item for the group key
      renderedItems.push(
        <StackedReasoning
          key={`group-${reasoningGroup[0].key}`}
          items={[...reasoningGroup]}
        />,
      );
    } else {
      // Render individually if 5 or fewer
      reasoningGroup.forEach((item) => {
        renderedItems.push(<MessageBubble key={item.key} item={item} />);
      });
    }
    reasoningGroup = [];
  };

  conversation.forEach((item) => {
    if (item.role === 'reasoning') {
      reasoningGroup.push(item);
    } else {
      flushReasoning();
      renderedItems.push(<MessageBubble key={item.key} item={item} />);
    }
  });

  // Flush any remaining items at the end
  flushReasoning();

  return <div className="max-w-4xl mx-auto py-6">{renderedItems}</div>;
}
