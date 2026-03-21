import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface GrowthRow {
  id: string;
  child_id: string;
  weight: number | null;
  height: number | null;
  note: string | null;
  measured_at: string;
  created_at: string;
}

export function useGrowth(childId: string | null) {
  const [measurements, setMeasurements] = useState<GrowthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!childId) {
      setMeasurements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('growth_measurements')
      .select('*')
      .eq('child_id', childId)
      .order('measured_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setMeasurements(data ?? []);
    }
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addMeasurement(data: {
    weight?: number;
    height?: number;
    note?: string;
    measured_at?: string;
  }) {
    if (!childId) throw new Error('No child selected');

    const { error: err } = await supabase
      .from('growth_measurements')
      .insert({
        child_id: childId,
        weight: data.weight ?? null,
        height: data.height ?? null,
        note: data.note ?? null,
        measured_at: data.measured_at ?? new Date().toISOString().split('T')[0],
      });

    if (err) throw new Error(err.message);

    // Also update child's current weight/height
    const updates: Record<string, unknown> = {};
    if (data.weight) {
      updates.weight = data.weight;
      updates.weight_updated_at = new Date().toISOString();
    }
    if (data.height) {
      updates.height = data.height;
      updates.height_updated_at = new Date().toISOString();
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('children').update(updates).eq('id', childId);
    }

    await fetch();
  }

  return { measurements, loading, error, addMeasurement, refetch: fetch };
}
