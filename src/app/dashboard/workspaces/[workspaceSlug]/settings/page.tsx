import { SecurityPolicyEditor } from '@/features/workspaces/components/security-policy-editor';
import { TelegramSettings } from '@/features/workspaces/components/telegram-settings';
import { saveSecurityRules } from '@/features/workspaces/contracts/save-security-rules';
import { getConnectedTelegram } from '@/features/workspaces/contracts/get-connected-telegram';
import { prisma } from '@/shared/lib/prisma';
import { notFound } from 'next/navigation';
import { PlanType } from '@/features/billing/contracts/billing.dto';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import Link from 'next/link';

import { InviteWorkspaceMemberForm } from '@/features/workspaces/components/invite-workspace-member-form';
import {
  ChevronRight,
  LayoutGrid,
  Settings,
  Building2,
  Users,
} from 'lucide-react';
import { WorkspaceGeneralSettings } from '@/features/workspaces/components/workspace-general-settings';
import { WorkspaceContributorsSettings } from '@/features/workspaces/components/workspace-contributors-settings';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

interface WorkspaceSettingsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceSlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const workspace = await prisma.workspace.findFirst({
    where: { slug: workspaceSlug },
    include: {
      user: true, // Include creator for fallback
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

  const owner = workspace.contributors.find((c) => c.role === 'owner');
  // Fallback to workspace creator if no owner contributor found (data inconsistency)
  const isOwnerPremium = owner
    ? owner.user.plan === PlanType.PREMIUM
    : workspace.user.plan === PlanType.PREMIUM;

  // If owner is premium, everyone in workspace has access to premium features of that workspace
  const isPremiumFeatureAvailable = isOwnerPremium;

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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="general">
            <Building2 className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="contributors">
            <Users className="w-4 h-4 mr-2" /> Team
          </TabsTrigger>
          <TabsTrigger value="security">Security Policy</TabsTrigger>
          <TabsTrigger value="telegram">Telegram Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <WorkspaceGeneralSettings workspace={workspace as any} />
        </TabsContent>

        <TabsContent value="contributors" className="mt-6 space-y-6">
          <InviteWorkspaceMemberForm workspaceId={workspace.id} />

          <WorkspaceContributorsSettings
            workspaceId={workspace.id}
            currentUserId={session?.user?.id || ''}
            ownerId={workspace.userId}
            contributors={workspace.contributors}
          />
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
          <TelegramSettings
            initialConnectedAccount={connectedTelegram}
            isPremiumFeatureAvailable={isPremiumFeatureAvailable}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
