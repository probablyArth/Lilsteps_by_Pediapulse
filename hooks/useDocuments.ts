import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface DocumentRow {
  id: string;
  child_id: string;
  title: string;
  category: 'prescription' | 'report' | 'lab_test' | 'visit_history' | 'other';
  file_url: string;
  file_type: string; // 'pdf' | 'image' | etc
  file_size: number | null;
  doctor_name: string | null;
  notes: string | null;
  document_date: string;
  created_at: string;
}

export function useDocuments(childId: string | null) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!childId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('documents')
      .select('*')
      .eq('child_id', childId)
      .order('document_date', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setDocuments(data ?? []);
    }
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function uploadDocument(params: {
    title: string;
    category: DocumentRow['category'];
    file_url: string;
    file_type: string;
    file_size?: number;
    doctor_name?: string;
    notes?: string;
    document_date?: string;
  }) {
    if (!childId) throw new Error('No child selected');

    const { error: err } = await supabase
      .from('documents')
      .insert({
        child_id: childId,
        title: params.title,
        category: params.category,
        file_url: params.file_url,
        file_type: params.file_type,
        file_size: params.file_size ?? null,
        doctor_name: params.doctor_name ?? null,
        notes: params.notes ?? null,
        document_date: params.document_date ?? new Date().toISOString().split('T')[0],
      });

    if (err) throw new Error(err.message);
    await fetch();
  }

  async function deleteDocument(docId: string) {
    const { error: err } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (err) throw new Error(err.message);
    await fetch();
  }

  return { documents, loading, error, uploadDocument, deleteDocument, refetch: fetch };
}
