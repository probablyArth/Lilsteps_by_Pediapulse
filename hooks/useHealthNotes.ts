import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface HealthNoteRow {
  id: string;
  child_id: string;
  category: 'symptom' | 'behaviour' | 'sleep' | 'feeding' | 'medication' | 'other';
  content: string;
  severity: number | null;
  photo_url: string | null;
  noted_at: string;
  created_at: string;
}

export function useHealthNotes(childId: string | null) {
  const [notes, setNotes] = useState<HealthNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!childId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('health_notes')
      .select('*')
      .eq('child_id', childId)
      .order('noted_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setNotes(data ?? []);
    }
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addNote(data: {
    category: HealthNoteRow['category'];
    content: string;
    severity?: number;
    photo_url?: string;
    noted_at?: string;
  }) {
    if (!childId) throw new Error('No child selected');

    const { error: err } = await supabase
      .from('health_notes')
      .insert({
        child_id: childId,
        category: data.category,
        content: data.content,
        severity: data.severity ?? null,
        photo_url: data.photo_url ?? null,
        noted_at: data.noted_at ?? new Date().toISOString(),
      });

    if (err) throw new Error(err.message);
    await fetch();
  }

  return { notes, loading, error, addNote, refetch: fetch };
}
