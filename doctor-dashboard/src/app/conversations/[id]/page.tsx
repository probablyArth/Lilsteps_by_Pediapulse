import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Composer } from './composer';
import { MessagesRealtime } from './realtime';

type MessageRow = {
  id: string;
  sender: 'parent' | 'doctor';
  content: string;
  created_at: string;
  read_at: string | null;
};

type ConversationDetail = {
  id: string;
  appointment_id: string | null;
  children: { id: string; name: string; dob: string; sex: string } | null;
  parents: { name: string | null; phone: string | null } | null;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, appointment_id, children(id, name, dob, sex), parents(name, phone)')
    .eq('id', id)
    .maybeSingle<ConversationDetail>();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender, content, created_at, read_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .returns<MessageRow[]>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-0">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">
            {conversation.children?.name ?? 'Unknown'}
          </h1>
          <p className="text-xs text-zinc-500">
            Parent: {conversation.parents?.name ?? conversation.parents?.phone ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conversation.appointment_id && (
            <Link
              href={`/conversations/${id}/video`}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Start video
            </Link>
          )}
          <Link
            href={`/prescriptions?child=${conversation.children?.id ?? ''}`}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            View prescriptions
          </Link>
          <Link
            href={`/prescriptions/new?child=${conversation.children?.id ?? ''}${
              conversation.appointment_id ? `&appointment=${conversation.appointment_id}` : ''
            }`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Issue prescription
          </Link>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto bg-zinc-50 px-6 py-6">
        {!messages || messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            No messages yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.sender === 'doctor'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-900'
                  }`}
                >
                  <div>{m.content}</div>
                  <div
                    className={`mt-1 text-[10px] ${
                      m.sender === 'doctor' ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Composer conversationId={id} />
      <MessagesRealtime conversationId={id} />
    </main>
  );
}
