import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { VideoRoom } from './video-room';

export default async function VideoCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Conversation may or may not have an appointment_id. Video only works when
  // it does (the video-room function is appointment-scoped).
  const { data: conversation } = await supabase
    .from('conversations')
    .select('appointment_id')
    .eq('id', id)
    .maybeSingle<{ appointment_id: string | null }>();

  if (!conversation) notFound();

  if (!conversation.appointment_id) {
    return (
      <main className="flex h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-zinc-500">
          Video is only available for scheduled consultations.
        </p>
      </main>
    );
  }

  return <VideoRoom appointmentId={conversation.appointment_id} />;
}
