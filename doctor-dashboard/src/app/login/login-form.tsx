'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    initialError ? { error: initialError } : null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
