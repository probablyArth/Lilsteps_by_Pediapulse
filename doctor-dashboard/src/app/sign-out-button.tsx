'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    const supabase = createSupabaseBrowserClient();
    startTransition(async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
