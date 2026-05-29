'use client';

import { useState, useTransition } from 'react';
import { createPrescriptionAction, type PrescriptionItemInput } from './actions';

interface Props {
  childId: string;
  childName: string;
  appointmentId: string | null;
}

function emptyItem(): PrescriptionItemInput {
  return { medicine: '', dose: '', frequency: '', duration: '', notes: '' };
}

export function PrescriptionForm({ childId, childName, appointmentId }: Props) {
  const [items, setItems] = useState<PrescriptionItemInput[]>([emptyItem()]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateItem(idx: number, patch: Partial<PrescriptionItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createPrescriptionAction({
        childId,
        appointmentId,
        notes: notes.trim() || null,
        items,
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-zinc-500">For</h2>
        <p className="text-base font-semibold">{childName}</p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-3 rounded-md border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Medicine {idx + 1}</h3>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs text-zinc-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={item.medicine}
                onChange={(e) => updateItem(idx, { medicine: e.target.value })}
                placeholder="Medicine name (e.g. Paracetamol)"
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
              />
              <input
                value={item.dose}
                onChange={(e) => updateItem(idx, { dose: e.target.value })}
                placeholder="Dose (e.g. 5ml / 250mg)"
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
              />
              <input
                value={item.frequency}
                onChange={(e) => updateItem(idx, { frequency: e.target.value })}
                placeholder="Frequency (e.g. 3 times a day)"
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
              />
              <input
                value={item.duration ?? ''}
                onChange={(e) => updateItem(idx, { duration: e.target.value })}
                placeholder="Duration (e.g. 5 days)"
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
              />
            </div>
            <textarea
              value={item.notes ?? ''}
              onChange={(e) => updateItem(idx, { notes: e.target.value })}
              placeholder="Special instructions (optional)"
              rows={2}
              className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          + Add another medicine
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Doctor notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the parent should know about this prescription."
          className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? 'Issuing…' : 'Issue prescription'}
        </button>
      </div>
    </div>
  );
}
