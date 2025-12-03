import { SecurityPolicyEditor } from '@/features/workspaces/components/security-policy-editor';
import { TelegramSettings } from '@/features/workspaces/components/telegram-settings';
import { saveSecurityRules } from '@/features/workspaces/contracts/save-security-rules';
import { getConnectedTelegram } from '@/features/workspaces/contracts/get-connected-telegram';
import { prisma } from '@/shared/lib/prisma';
import { notFound } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import Link from 'next/link';
import { ChevronRight, LayoutGrid, Settings } from 'lucide-react';

interface WorkspaceSettingsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug },
    include: {
      securityRules: true,
    },
  });

  if (!workspace) {
    notFound();
  }

  const connectedTelegram = await getConnectedTelegram();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Stylish Breadcrumb / Path */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 bg-zinc-900/50 w-fit px-3 py-1.5 rounded-md border border-zinc-800/50 select-none">
          <span className="text-emerald-500/50 mr-1">~/</span>

          <Link
            href={`/dashboard/workspaces/${workspace.slug}`}
            className="flex items-center gap-1.5 hover:text-emerald-400 hover:bg-emerald-500/10 px-1.5 py-0.5 rounded transition-all cursor-pointer"
          >
            <LayoutGrid size={12} />
            {workspace.name}
          </Link>

          <ChevronRight size={10} className="text-zinc-700" />

          <span className="flex items-center gap-1.5 text-zinc-200 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">
            <Settings size={12} />
            settings
          </span>
        </div>

        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage your workspace configuration and security policies.
          </p>
        </div>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="security">Security Policy</TabsTrigger>
          <TabsTrigger value="telegram">Telegram Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="mt-6">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <SecurityPolicyEditor
              workspaceId={workspace.id}
              initialRules={workspace.securityRules}
              onSave={saveSecurityRules}
            />
          </div>
        </TabsContent>

        <TabsContent value="telegram" className="mt-6">
          <TelegramSettings initialConnectedAccount={connectedTelegram} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
