'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updateMeetLinkAction(link: string): Promise<{ error?: string }> {
  const url = link.trim();
  if (url && !/^https?:\/\//i.test(url)) {
    return { error: 'Link must start with https:// (or http://)' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { data: auth } = await supabase
    .from('doctor_auth')
    .select('doctor_id')
    .eq('id', user.id)
    .maybeSingle<{ doctor_id: string }>();
  if (!auth) return { error: 'Not a doctor account' };

  const { error } = await supabase
    .from('doctors')
    .update({ default_meet_link: url || null })
    .eq('id', auth.doctor_id);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  revalidatePath('/');
  return {};
}
