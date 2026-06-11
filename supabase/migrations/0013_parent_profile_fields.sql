-- Parent profile fields collected in onboarding (parent-details screen).
-- Previously the screen collected these and dropped them on the floor.

alter table public.parents
  add column if not exists city text,
  add column if not exists preferred_language text;
