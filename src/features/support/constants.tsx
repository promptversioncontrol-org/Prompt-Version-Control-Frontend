import {
  Book,
  Terminal,
  Settings,
  Shield,
  Globe,
  MessageSquare,
} from 'lucide-react';

export const SUPPORT_TOPICS = [
  {
    icon: Book,
    title: 'Documentation',
    description: 'Detailed guides and API references for integrating PVC.',
    href: '/docs',
  },
  {
    icon: Terminal,
    title: 'CLI Reference',
    description: 'Commands, installation, and configuration for the PVC CLI.',
    href: '/docs/cli',
  },
  {
    icon: Settings,
    title: 'Account & Billing',
    description: 'Manage your organization, team members, and subscription.',
    href: '/settings',
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Learn how we handle data, encryption, and compliance.',
    href: '/security',
  },
  {
    icon: Globe,
    title: 'Platform Status',
    description: 'Check real-time status of our API, Dashboard, and Proxy.',
    href: 'https://status.pvc.dev',
  },
  {
    icon: MessageSquare,
    title: 'Community',
    description: 'Join our Discord server to chat with other developers.',
    href: 'https://discord.gg/pvc',
  },
];
