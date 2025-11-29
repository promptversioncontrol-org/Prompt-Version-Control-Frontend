import Link from 'next/link';
import Image from 'next/image';
import SignInForm from '@/features/auth/components/signin-form';

function FloatingNavbar({
  actionHref,
  actionLabel,
}: {
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <nav className="fixed inset-x-0 top-4 z-50 pointer-events-none">
      <div className="flex items-center justify-between w-full px-6 pointer-events-auto">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={60}
            height={60}
            className="h-15 w-auto"
          />
        </Link>

        <Link
          href={actionHref}
          className="px-3 py-2 rounded-md text-sm bg-white"
        >
          {actionLabel}
        </Link>
      </div>
    </nav>
  );
}

export default function SignInPage() {
  return (
    <>
      <FloatingNavbar actionHref="/sign-up" actionLabel="Sign up" />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
          <SignInForm />
          <p className="mt-4 text-sm">
            Don&apos;t have an account?
            <Link href="/sign-up" className="text-blue-600 underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-sm">
            Back to
            <Link href="/" className="text-blue-600 underline">
              Home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
