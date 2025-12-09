import { notFound, redirect } from 'next/navigation';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { WorkspaceBreadcrumb } from '@/features/workspaces/components/workspace-breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Folder, FileCode, ShieldAlert, UploadCloud, Calendar } from 'lucide-react';
import { FileBrowser } from '@/features/workspaces/components/file-browser';
// Separator removed

interface UserDetailsPageProps {
  params: Promise<{
    workspaceSlug: string;
    username: string;
  }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { workspaceSlug, username } = await params;
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(h => h.headers()),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch logic (bez zmian logicznych, skrócone dla czytelności)
  const workspaceAccess = await prisma.workspace.findFirst({
    where: {
       slug: workspaceSlug,
       OR: [
          { userId: session.user.id },
          { contributors: { some: { userId: session.user.id } } }
       ]
    },
    include: {
      contributors: {
         where: { user: { username: username } },
         include: { user: true }
      }
    }
  });

  if (!workspaceAccess) notFound();

  const targetUser = await prisma.user.findUnique({
    where: { username },
    include: {
       contributions: { where: { workspaceId: workspaceAccess.id } }
    }
  });

  const isOwner = workspaceAccess.userId === targetUser?.id;
  const isContributor = targetUser?.contributions.length ?? 0 > 0;

  if (!targetUser || (!isOwner && !isContributor)) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
       {/* Ambient Background */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-6 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
           <WorkspaceBreadcrumb workspaceSlug={workspaceSlug} />
           
           <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-8 shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FileCode size={200} />
              </div>
              
              <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                 <Avatar className="h-24 w-24 border-4 border-zinc-950 shadow-2xl ring-2 ring-zinc-800">
                    <AvatarImage src={targetUser.image || undefined} />
                    <AvatarFallback className="bg-zinc-800 text-3xl font-bold text-zinc-300">
                       {targetUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
                 
                 <div className="space-y-2 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                       <h1 className="text-3xl font-bold text-white tracking-tight">
                          {targetUser.name}
                       </h1>
                       {isOwner ? (
                          <Badge className="w-fit bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 px-3 py-1">
                             Workspace Owner
                          </Badge>
                       ) : (
                          <Badge variant="outline" className="w-fit bg-zinc-800/50 text-zinc-400 border-zinc-700 px-3 py-1">
                             Contributor
                          </Badge>
                       )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                       <span className="font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          @{targetUser.username}
                       </span>
                       <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                          {targetUser.email}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           
           {/* Left Column: File Browser (Takes more space) */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <Folder className="h-5 w-5 text-indigo-400" />
                    File Explorer
                 </h2>
              </div>
              
              <FileBrowser 
                 workspaceId={workspaceAccess.id} 
                 userId={targetUser.id} 
              />
           </div>

           {/* Right Column: Stats & Activity */}
           <div className="space-y-6">
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md shadow-lg">
                 <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <ShieldAlert className="h-4 w-4" />
                       Security & Stats
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                       <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Uploaded</span>
                       <div className="flex items-end gap-2">
                          <span className="text-2xl font-mono font-bold text-white">0</span>
                          <UploadCloud className="h-4 w-4 text-zinc-600 mb-1" />
                       </div>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                       <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Leaks</span>
                       <div className="flex items-end gap-2">
                          <span className="text-2xl font-mono font-bold text-white">0</span>
                          <ShieldAlert className="h-4 w-4 text-rose-500/70 mb-1" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-md shadow-lg flex-1">
                 <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Calendar className="h-4 w-4" />
                       Recent Activity
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                       <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center border border-dashed border-zinc-700">
                          <Calendar className="h-6 w-6 text-zinc-600" />
                       </div>
                       <p className="text-sm text-zinc-500 max-w-[180px]">
                          No recent activity recorded for this user.
                       </p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}