'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/shared/components/ui/input';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  Search,
  ArrowRight,
  Terminal,
  Globe,
  Shield,
  Code,
  CreditCard,
  Mail,
} from 'lucide-react';

// --- SEARCH COMPONENT ---
export function HelpSearch() {
  return (
    <div className="relative max-w-2xl mx-auto w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
      </div>
      <Input
        placeholder="Search for answers..."
        className="pl-12 h-14 bg-zinc-900/80 border-zinc-800 text-lg rounded-2xl focus:border-zinc-700 focus:ring-0 focus:bg-zinc-900 transition-all placeholder:text-zinc-600 shadow-xl"
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-zinc-500 bg-zinc-800 rounded border border-zinc-700 font-mono">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

// --- TOPICS GRID ---
const TOPICS = [
  {
    icon: Terminal,
    title: 'CLI Reference',
    description: 'Commands, flags, and configuration for the terminal tool.',
    href: '/docs/cli',
  },
  {
    icon: Globe,
    title: 'Remote Sync',
    description: 'Connecting local projects to cloud workspaces.',
    href: '/docs/remote',
  },
  {
    icon: Shield,
    title: 'Security Rules',
    description: 'Defining and enforcing leakage prevention rules.',
    href: '/docs/security',
  },
  {
    icon: Code,
    title: 'API Integration',
    description: 'Integrating PVC into your CI/CD pipelines.',
    href: '/docs/api',
  },
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Managing subscriptions, invoices and seats.',
    href: '/docs/billing',
  },
  {
    icon: Globe,
    title: 'Proxy Setup',
    description: 'Configuring the interception proxy for LLMs.',
    href: '/docs/proxy',
  },
];

export function HelpTopicsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOPICS.map((topic, i) => (
        <Link href={topic.href} key={i} className="group">
          <div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-zinc-700 transition-all">
              <topic.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-zinc-200 group-hover:text-white mb-2 flex items-center justify-between">
              {topic.title}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400" />
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {topic.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// --- TEAM GRID ---
const TEAM_MEMBERS = [
  {
    name: 'Adam Pukaluk',
    role: 'Lead Engineer',
    email: 'pukaluk.adam505@gmail.com',
    image: 'https://github.com/Adam903PL.png',
  },
  {
    name: 'Sarah Chen',
    role: 'Security Specialist',
    email: 'sarah@pvc.dev',
    image: null,
  },
  {
    name: 'Mike Ross',
    role: 'Customer Success',
    email: 'mike@pvc.dev',
    image: null,
  },
  {
    name: 'Alex V.',
    role: 'DevOps Engineer',
    email: 'alex@pvc.dev',
    image: null,
  },
];

export function TeamGrid() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {TEAM_MEMBERS.map((member, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group"
        >
          <Avatar className="h-12 w-12 border border-zinc-800">
            <AvatarImage src={member.image || undefined} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400">
              {member.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {member.name}
            </h4>
            <p className="text-xs text-zinc-500 truncate">{member.role}</p>
          </div>
          <a
            href={`mailto:${member.email}`}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      ))}
    </div>
  );
}

// --- FAQ SECTION ---
const FAQS = [
  {
    q: 'How do I reset my API key?',
    a: 'You can rotate your API keys in the Settings > API section of your dashboard. Old keys will stop working immediately.',
  },
  {
    q: 'Is PVC compatible with custom LLM endpoints?',
    a: 'Yes, you can configure custom base URLs in your project settings to support local models or private deployments.',
  },
  {
    q: 'What happens if I exceed my plan limits?',
    a: 'We will notify you when you reach 80% and 100% of your limit. Requests may be rate-limited afterwards until you upgrade.',
  },
  {
    q: 'Can I self-host PVC?',
    a: 'Self-hosting is available on our Enterprise plan. Please contact sales for more information.',
  },
];

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQS.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-zinc-800">
          <AccordionTrigger className="text-zinc-200 hover:text-white hover:no-underline py-4 text-left">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="text-zinc-400 pb-4 leading-relaxed">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
