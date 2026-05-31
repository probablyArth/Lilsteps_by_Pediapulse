'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getVideoCodeAction(
  appointmentId: string,
): Promise<{ error?: string; code?: string; role?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: 'Not authenticated' };

  const { data, error } = await supabase.functions.invoke<{
    code?: string;
    role?: string;
    error?: string;
  }>('video-room', { body: { appointmentId } });

  if (error) return { error: error.message };
  if (!data?.code) return { error: data?.error ?? 'No code returned' };

  return { code: data.code, role: data.role };
}
