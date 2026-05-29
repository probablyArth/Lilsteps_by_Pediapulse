import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ConversationRow = {
  id: string;
  last_message_at: string;
  children: { id: string; name: string; dob: string } | null;
  parents: { name: string | null; phone: string | null } | null;
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}

export default async function ConversationsPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('id, last_message_at, children(id, name, dob), parents(name, phone)')
    .order('last_message_at', { ascending: false })
    .returns<ConversationRow[]>();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="text-sm text-zinc-500">
          Messages from parents about their children.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No conversations yet.
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200 bg-white">
          {data.map((c) => (
            <li key={c.id}>
              <Link
                href={`/conversations/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <div className="text-sm font-medium">
                    {c.children?.name ?? 'Unknown child'}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Parent: {c.parents?.name ?? c.parents?.phone ?? '—'}
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  {formatTimestamp(c.last_message_at)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
