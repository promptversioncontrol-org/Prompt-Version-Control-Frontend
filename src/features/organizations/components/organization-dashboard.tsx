'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Organization } from '@prisma/client';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  Plus,
  Package,
  Layout,
  Calendar,
  ArrowRight,
  Settings,
  Users,
  Shield,
} from 'lucide-react';
import { OrganizationMembersSettings } from './organization-members-settings';
import { OrganizationRolesSettings } from './organization-roles-settings';

// Ensure this matches your Prisma/DB types
interface Role {
  id: string;
  name: string;
  workspaceIds: string[];
  membersCount?: number;
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    contributions: { workspaceId: string }[];
  };
}

interface WorkspaceSummary {
  id: string;
  name: string | null;
  slug: string;
  description: string | null;
  createdAt: Date;
}

interface OrganizationDashboardProps {
  organization: Organization;
  workspaces: WorkspaceSummary[];
  members: Member[];
  roles: Role[];
  currentUserId: string;
  initialTab?: string;
}

export function OrganizationDashboard({
  organization,
  workspaces,
  members,
  roles,
  currentUserId,
  initialTab = 'workspaces',
}: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="space-y-8">
      {/* Custom Tab List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-zinc-800 mb-8">
          <TabsList className="bg-transparent p-0 h-auto gap-6">
            <TabsTrigger
              value="workspaces"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent rounded-none px-0 py-3 text-zinc-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
            >
              <Layout className="h-4 w-4 mr-2" /> Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent rounded-none px-0 py-3 text-zinc-400 data-[state=active]:text-white data-[state=active]:shadow-none transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* WORKSPACES TAB */}
        <TabsContent
          value="workspaces"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Workspaces
              </h2>
              <p className="text-zinc-400 mt-2 text-base">
                Access and manage all projects within{' '}
                <span className="text-zinc-200 font-medium">
                  {organization.name}
                </span>
                .
              </p>
            </div>
            <Link href={`/workspaces/new?organizationId=${organization.id}`}>
              <Button className="bg-white text-black hover:bg-zinc-200 font-medium">
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.length === 0 && (
              <div className="col-span-full">
                <div className="border border-dashed border-zinc-800 bg-zinc-900/20 rounded-xl py-20 px-6 text-center flex flex-col items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
                    <Package className="h-10 w-10 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-200 mb-2">
                    No workspaces yet
                  </h3>
                  <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
                    Workspaces help you organize your prompts and collaborate
                    with your team. Create your first one to get started.
                  </p>
                  <Link
                    href={`/workspaces/new?organizationId=${organization.id}`}
                  >
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {workspaces.map((ws) => (
              <Link
                href={`/dashboard/workspaces/${ws.slug}`}
                key={ws.id}
                className="group h-full block"
              >
                <Card className="h-full bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-300 backdrop-blur-sm overflow-hidden flex flex-col">
                  <CardHeader className="pb-4 relative">
                    {/* Decorative gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />

                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <CardTitle className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                          {ws.name}
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs font-mono mt-1">
                          /{ws.slug}
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-300 transition-colors">
                        <Layout className="w-4 h-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow py-2 relative z-10">
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {ws.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 mt-auto border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent
          value="settings"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
            <p className="text-zinc-400">
              Manage team access and organization roles.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Members Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-semibold text-white pb-2 border-b border-zinc-800/50">
                <Users className="w-5 h-5 text-blue-400" />
                <h2>Team Members</h2>
              </div>
              <Card className="bg-zinc-900/20 border-zinc-800 backdrop-blur-sm">
                <CardContent className="p-0">
                  <OrganizationMembersSettings
                    organizationId={organization.id}
                    members={members}
                    roles={roles} // Passing roles down
                    workspaces={workspaces}
                    currentUserId={currentUserId}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Roles Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-semibold text-white pb-2 border-b border-zinc-800/50">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2>Role Management</h2>
              </div>
              <Card className="bg-zinc-900/20 border-zinc-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <OrganizationRolesSettings
                    organizationId={organization.id}
                    roles={roles}
                    workspaces={workspaces}
                  />
                </CardContent>
              </Card>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
