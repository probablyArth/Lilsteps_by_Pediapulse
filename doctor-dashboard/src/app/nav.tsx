import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignOutButton } from './sign-out-button';

export async function DashboardNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Pedia Pulse
          </Link>
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            Queue
          </Link>
          <Link
            href="/conversations"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Conversations
          </Link>
          <Link
            href="/prescriptions"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Prescriptions
          </Link>
        </div>
        <SignOutButton />
      </div>
    </nav>
  );
}
