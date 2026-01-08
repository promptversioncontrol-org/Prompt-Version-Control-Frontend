import { ProxyView } from '@/features/docs/components/proxy-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PVC Proxy - Local AI Firewall',
  description: 'Secure, observable, and policy-compliant AI request handling.',
};

export default function ProxyPage() {
  return <ProxyView />;
}
