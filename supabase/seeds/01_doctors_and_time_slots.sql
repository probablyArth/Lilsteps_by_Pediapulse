-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: doctors + time_slots
--
-- Run this once via Supabase Dashboard → SQL Editor → paste + Run.
-- Idempotent: safe to re-run; uses ON CONFLICT to skip duplicates.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Doctors ──────────────────────────────────────────────────────────────────
-- Note: doctors table has no unique constraint on name — we guard with NOT EXISTS
-- so re-running this script doesn't create duplicates.
INSERT INTO public.doctors (name, specialisation, hospital, is_available)
SELECT * FROM (VALUES
  ('Dr. Sarah Miller',  'Pediatrician',                'St. Jude''s Pediatric Center', true),
  ('Dr. Ramesh Gupta',  'General Physician',           'Apollo Children''s Clinic',    true),
  ('Dr. Emily Chen',    'Developmental Pediatrician',  'City Health Clinic',           true)
) AS v(name, specialisation, hospital, is_available)
WHERE NOT EXISTS (
  SELECT 1 FROM public.doctors d WHERE d.name = v.name
);

-- ─── Time slots — next 7 days, 12 slots/day per doctor ───────────────────────
-- Skips Sundays. ~75% of slots marked available (deterministic pseudo-random
-- via hashtext, so re-running gives the same shape).
WITH days AS (
  SELECT (CURRENT_DATE + i) AS slot_date
  FROM generate_series(0, 6) AS i
  WHERE EXTRACT(DOW FROM (CURRENT_DATE + i)) <> 0
),
slot_times AS (
  SELECT t::time AS slot_time
  FROM (VALUES
    ('09:00'), ('09:30'), ('10:00'), ('10:30'), ('11:00'), ('11:30'),
    ('14:00'), ('14:30'), ('15:00'), ('15:30'), ('16:00'), ('16:30')
  ) AS s(t)
)
INSERT INTO public.time_slots (doctor_id, date, time, is_available)
SELECT
  d.id,
  days.slot_date,
  slot_times.slot_time,
  -- ~75% available, deterministic per (doctor, date, time)
  (
    (
      extract(epoch from (days.slot_date::timestamp + slot_times.slot_time))::bigint
      + abs(hashtext(d.id::text))
    ) % 4
  ) <> 0
FROM public.doctors d
CROSS JOIN days
CROSS JOIN slot_times
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_slots ts
  WHERE ts.doctor_id = d.id
    AND ts.date = days.slot_date
    AND ts.time = slot_times.slot_time
);

-- ─── Verification ─────────────────────────────────────────────────────────────
-- After running the inserts, these should print non-zero counts.
SELECT 'doctors'    AS table_name, count(*) FROM public.doctors
UNION ALL
SELECT 'time_slots' AS table_name, count(*) FROM public.time_slots;
