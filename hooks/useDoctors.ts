import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface DoctorRow {
  id: string;
  name: string;
  specialisation: string;
  hospital: string;
  avatar_url: string | null;
  is_available: boolean;
}

export interface TimeSlotRow {
  id: string;
  doctor_id: string;
  date: string;
  time: string;
  is_available: boolean;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (err) {
        setError(err.message);
      } else {
        setDoctors(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  return { doctors, loading, error };
}

export function useTimeSlots(doctorId: string | null, date: string | null) {
  const [slots, setSlots] = useState<TimeSlotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .order('time');

    if (err) {
      setError(err.message);
    } else {
      setSlots(data ?? []);
    }
    setLoading(false);
  }, [doctorId, date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { slots, loading, error, refetch: fetch };
}
