import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PrescriptionRow = {
  id: string;
  issued_at: string;
  notes: string | null;
  child_id: string;
  children: { id: string; name: string } | null;
  prescription_items: {
    id: string;
    medicine: string;
    dose: string;
    frequency: string;
    duration: string | null;
    position: number;
  }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child: childFilter } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let q = supabase
    .from('prescriptions')
    .select('id, issued_at, notes, child_id, children(id, name), prescription_items(id, medicine, dose, frequency, duration, position)')
    .order('issued_at', { ascending: false });

  if (childFilter) q = q.eq('child_id', childFilter);

  const { data, error } = await q.returns<PrescriptionRow[]>();

  const childName = data?.find((p) => p.children?.id === childFilter)?.children?.name;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {childName ? `${childName}'s prescriptions` : 'Prescriptions'}
          </h1>
          <p className="text-sm text-zinc-500">
            All prescriptions you have issued{childName ? ` for ${childName}` : ''}.
          </p>
        </div>
        {childFilter && (
          <Link
            href={`/prescriptions/new?child=${childFilter}`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New prescription
          </Link>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No prescriptions issued yet.
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((p) => {
            const items = [...p.prescription_items].sort((a, b) => a.position - b.position);
            return (
              <li key={p.id} className="rounded-md border border-zinc-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    {!childFilter && (
                      <div className="text-sm font-medium">{p.children?.name ?? 'Unknown child'}</div>
                    )}
                    <div className="text-xs text-zinc-500">{formatDate(p.issued_at)}</div>
                  </div>
                </div>
                {items.length > 0 && (
                  <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-100">
                    {items.map((it) => (
                      <li key={it.id} className="px-3 py-2 text-sm">
                        <div className="font-medium">{it.medicine}</div>
                        <div className="text-xs text-zinc-500">
                          {it.dose} · {it.frequency}
                          {it.duration ? ` · ${it.duration}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {p.notes && (
                  <p className="mt-3 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">{p.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
