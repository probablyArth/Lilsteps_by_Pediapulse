'use client';

import { useRef, useState, useTransition } from 'react';
import { sendMessageAction } from './actions';

export function Composer({ conversationId }: { conversationId: string }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setError(null);
    setDraft('');
    startTransition(async () => {
      const result = await sendMessageAction(conversationId, content);
      if (result.error) {
        setError(result.error);
        setDraft(content);
      } else {
        textareaRef.current?.focus();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-zinc-200 bg-white p-3">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Reply to the parent…"
        rows={1}
        className="flex-1 resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget.form as HTMLFormElement).requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        disabled={pending || draft.trim().length === 0}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send'}
      </button>
      {error && (
        <span className="absolute -mt-12 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </span>
      )}
    </form>
  );
}
