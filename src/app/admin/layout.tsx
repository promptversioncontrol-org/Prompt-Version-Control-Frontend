import { auth } from '@/shared/lib/auth'; // Using your auth lib
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/');
  }

  // Admin Verification Logic
  const isAdmin =
    session.user.email === 'pukaluk.adam505@gmail.com' ||
    (session.user as { role?: string }).role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage support tickets and users.</p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
