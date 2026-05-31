import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { VideoRoom } from './video-room';

export default async function VideoCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: appointmentId } = await params;
  const supabase = await createSupabaseServerClient();

  // [id] is the appointment id directly under /consultations/[id]/video.
  // Validate it exists and the doctor has access (RLS on appointments handles
  // the access check — if doctor isn't assigned, the row won't return).
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .maybeSingle<{ id: string }>();

  if (!appointment) notFound();

  return <VideoRoom appointmentId={appointmentId} />;
}
