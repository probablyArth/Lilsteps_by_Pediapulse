'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function currentDoctorId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('doctor_auth')
    .select('doctor_id')
    .eq('id', user.id)
    .maybeSingle<{ doctor_id: string }>();
  return data?.doctor_id ?? null;
}

export interface GenerateSlotsInput {
  startDate: string;   // YYYY-MM-DD
  days: number;        // 1..30
  startHour: number;   // 0..23
  endHour: number;     // > startHour
  intervalMinutes: 15 | 30 | 45 | 60;
  skipSundays: boolean;
}

export async function generateSlotsAction(
  input: GenerateSlotsInput,
): Promise<{ error?: string; inserted?: number }> {
  if (input.days < 1 || input.days > 30) return { error: 'Days must be 1–30' };
  if (input.endHour <= input.startHour) return { error: 'End hour must be after start hour' };

  const doctorId = await currentDoctorId();
  if (!doctorId) return { error: 'Not signed in as a doctor' };

  const supabase = await createSupabaseServerClient();
  const rows: { doctor_id: string; date: string; time: string; is_available: boolean }[] = [];

  const start = new Date(`${input.startDate}T00:00:00`);
  for (let d = 0; d < input.days; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (input.skipSundays && day.getDay() === 0) continue;
    const isoDate = day.toISOString().slice(0, 10);

    for (let h = input.startHour; h < input.endHour; h++) {
      for (let m = 0; m < 60; m += input.intervalMinutes) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        rows.push({ doctor_id: doctorId, date: isoDate, time, is_available: true });
      }
    }
  }

  if (rows.length === 0) return { error: 'No slots to generate' };

  const { error, count } = await supabase
    .from('time_slots')
    .upsert(rows, { onConflict: 'doctor_id,date,time', count: 'exact', ignoreDuplicates: true });

  if (error) return { error: error.message };

  revalidatePath('/availability');
  return { inserted: count ?? rows.length };
}

export async function toggleSlotAction(
  slotId: string,
  available: boolean,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('time_slots')
    .update({ is_available: available })
    .eq('id', slotId);
  if (error) return { error: error.message };
  revalidatePath('/availability');
  return {};
}

export async function deleteSlotAction(slotId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('time_slots').delete().eq('id', slotId);
  if (error) return { error: error.message };
  revalidatePath('/availability');
  return {};
}

export async function deleteSlotsForDateAction(
  date: string,
): Promise<{ error?: string; deleted?: number }> {
  const doctorId = await currentDoctorId();
  if (!doctorId) return { error: 'Not signed in as a doctor' };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .from('time_slots')
    .delete({ count: 'exact' })
    .eq('doctor_id', doctorId)
    .eq('date', date);
  if (error) return { error: error.message };
  revalidatePath('/availability');
  return { deleted: count ?? 0 };
}
