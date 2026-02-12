import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Activity, BarChart3, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
      </div>

      {/* Stats Grid Placeholders */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">
              Total Revenue
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">$0.00</div>
            <p className="text-xs text-zinc-500">+0% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">0</div>
            <p className="text-xs text-zinc-500">+0 since last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">
              Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">+0</div>
            <p className="text-xs text-zinc-500">+0% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Placeholder */}
      <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-zinc-100">Recent Activity</CardTitle>
          <CardDescription className="text-zinc-400">
            Your recent workspace activities will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-zinc-500">
          No recent activity to show
        </CardContent>
      </Card>
    </div>
  );
}
