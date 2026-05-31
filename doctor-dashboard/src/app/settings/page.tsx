import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeetLinkForm } from './meet-form';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let meetLink: string | null = null;

  if (user) {
    const { data: auth } = await supabase
      .from('doctor_auth')
      .select('doctor_id')
      .eq('id', user.id)
      .maybeSingle<{ doctor_id: string }>();
    if (auth) {
      const { data: doc } = await supabase
        .from('doctors')
        .select('default_meet_link')
        .eq('id', auth.doctor_id)
        .maybeSingle<{ default_meet_link: string | null }>();
      meetLink = doc?.default_meet_link ?? null;
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
      <header className="mb-12 fade-up">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-3)]">
          Practice
        </div>
        <h1 className="mt-4 font-display text-[56px] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
          <span className="font-display-italic">Settings</span>
        </h1>
        <p className="mt-4 max-w-xl font-display-italic text-[18px] leading-[1.55] text-[var(--ink-2)]">
          Configuration for your consultations.
        </p>
      </header>

      <section className="border-t border-[var(--hairline)] pt-8">
        <h2 className="mb-6 font-display text-[28px] leading-tight tracking-[-0.02em] text-[var(--ink)]">
          <span className="font-display-italic">Video</span> room
        </h2>
        <MeetLinkForm initialLink={meetLink} />
      </section>
    </main>
  );
}
