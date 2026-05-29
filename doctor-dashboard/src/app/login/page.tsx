import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === 'not_a_doctor'
      ? 'This account is not authorised for the doctor dashboard.'
      : null;

  return (
    <main className="flex min-h-full w-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Doctor sign in</h1>
          <p className="text-sm text-zinc-500">
            Pedia Pulse clinical dashboard.
          </p>
        </div>
        <LoginForm initialError={initialError} />
      </div>
    </main>
  );
}
