import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrescriptionForm } from './prescription-form';

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; appointment?: string }>;
}) {
  const { child: childId, appointment: appointmentId } = await searchParams;
  if (!childId) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: child } = await supabase
    .from('children')
    .select('id, name')
    .eq('id', childId)
    .maybeSingle<{ id: string; name: string }>();

  if (!child) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">New prescription</h1>
        <p className="text-sm text-zinc-500">
          Issue a prescription that the parent will see in the app.
        </p>
      </header>
      <PrescriptionForm
        childId={child.id}
        childName={child.name}
        appointmentId={appointmentId ?? null}
      />
    </main>
  );
}
