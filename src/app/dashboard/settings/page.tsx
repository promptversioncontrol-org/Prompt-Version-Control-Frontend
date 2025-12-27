import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TwoFactorSetup } from '@/features/auth/components/two-factor-setup';
import { EmailVerificationSettings } from '@/features/auth/components/email-verification-settings';
import { PasskeySettings } from '@/features/auth/components/passkey-settings';
import { UserProfileSettings } from '@/features/users/components/user-profile-settings';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { User, Shield, Sliders, Trash2, Bell, Globe, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 w-full items-stretch">
            <TabsTrigger
              value="general"
              className="justify-start gap-3 px-4 py-3 h-auto text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-zinc-900/50 hover:text-zinc-300 transition-colors rounded-lg"
            >
              <User size={16} /> General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="justify-start gap-3 px-4 py-3 h-auto text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-zinc-900/50 hover:text-zinc-300 transition-colors rounded-lg"
            >
              <Shield size={16} /> Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="justify-start gap-3 px-4 py-3 h-auto text-zinc-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-zinc-900/50 hover:text-zinc-300 transition-colors rounded-lg"
            >
              <Sliders size={16} /> Preferences
            </TabsTrigger>
            <div className="h-px bg-zinc-900 my-2 mx-2"></div>
            <TabsTrigger
              value="danger"
              className="justify-start gap-3 px-4 py-3 h-auto text-red-500/80 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500 data-[state=active]:shadow-none hover:bg-red-500/5 hover:text-red-400 transition-colors rounded-lg"
            >
              <Trash2 size={16} /> Danger Zone
            </TabsTrigger>
          </TabsList>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* --- GENERAL TAB --- */}
          <TabsContent value="general" className="space-y-6 mt-0">
            <UserProfileSettings user={user} />
          </TabsContent>

          {/* --- SECURITY TAB --- */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Authentication</CardTitle>
                <CardDescription>
                  Manage how you login to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <h4 className="text-sm font-medium text-white">
                      Email Verification
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Ensure your email is verified to access all features.
                    </p>
                  </div>
                  <EmailVerificationSettings />
                </div>

                <Separator className="bg-zinc-800" />

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-white">
                      <Lock size={14} /> Passkeys
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Login securely with FaceID, TouchID or Windows Hello.
                    </p>
                  </div>
                  <PasskeySettings />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorSetup />
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- PREFERENCES TAB --- */}
          <TabsContent value="preferences" className="space-y-6 mt-0">
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Notifications</CardTitle>
                <CardDescription>
                  Choose what we should notify you about.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <Bell size={14} /> Marketing Emails
                    </div>
                    <div className="text-xs text-zinc-500">
                      Receive news about new features and updates.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-zinc-700 text-zinc-300"
                  >
                    Enabled
                  </Button>
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <Shield size={14} /> Security Alerts
                    </div>
                    <div className="text-xs text-zinc-500">
                      Receive notifications about suspicious activity.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-zinc-700 text-zinc-300"
                    disabled
                  >
                    Always On
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Localization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <Globe size={14} /> Language
                    </div>
                    <div className="text-xs text-zinc-500">
                      Select your preferred language.
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400">English (US)</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- DANGER TAB --- */}
          <TabsContent value="danger" className="space-y-6 mt-0">
            <Card className="bg-red-950/10 border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-500">Delete Account</CardTitle>
                <CardDescription className="text-red-400/60">
                  Permanently remove your account and all of its data. This
                  action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
