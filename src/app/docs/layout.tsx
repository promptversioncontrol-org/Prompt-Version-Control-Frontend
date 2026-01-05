import type { Metadata } from 'next';
import { DocsLayoutWrapper } from '@/features/docs/components/docs-layout-wrapper';

export const metadata: Metadata = {
  title: 'Documentation - PVC',
  description: 'Documentation for Prompt Version Control CLI',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutWrapper>{children}</DocsLayoutWrapper>;
}
