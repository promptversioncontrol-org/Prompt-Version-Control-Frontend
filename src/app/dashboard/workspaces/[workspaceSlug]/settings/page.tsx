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
import { InviteWorkspaceMemberForm } from '@/features/workspaces/components/invite-workspace-member-form';

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
      contributors: {
        include: {
          user: true,
        },
      },
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

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="security">Security Policy</TabsTrigger>
          <TabsTrigger value="telegram">Telegram Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6 space-y-6">
          <InviteWorkspaceMemberForm workspaceId={workspace.id} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
              <h3 className="font-medium text-zinc-200">Current Members</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {workspace.contributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
                      {contributor.user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {contributor.user.username || contributor.user.email}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {contributor.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 capitalize bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    {contributor.role}
                  </div>
                </div>
              ))}
              {workspace.contributors.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No members found.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

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
