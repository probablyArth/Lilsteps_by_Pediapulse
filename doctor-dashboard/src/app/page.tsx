import { createSupabaseServerClient } from '@/lib/supabase/server';

type QueueRow = {
  id: string;
  date: string;
  time: string;
  status: string;
  summary_ready: boolean;
  ai_summary_id: string | null;
  children: { id: string; name: string; dob: string; sex: string } | null;
};

export default async function QueuePage() {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('id, date, time, status, summary_ready, ai_summary_id, children(id, name, dob, sex)')
    .gte('date', today)
    .in('status', ['upcoming'])
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .returns<QueueRow[]>();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s queue</h1>
          <p className="text-sm text-zinc-500">
            Upcoming appointments. AI summaries are available where prepared.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No upcoming appointments.
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200 bg-white">
          {data.map((appt) => (
            <li key={appt.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">
                  {appt.children?.name ?? 'Unknown child'}
                </div>
                <div className="text-xs text-zinc-500">
                  {appt.date} · {appt.time.slice(0, 5)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {appt.summary_ready ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    AI summary ready
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                    No summary
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
