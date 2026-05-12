# LilSteps — Project Status

_Snapshot as of 2026-05-03. This is a working reference, not a spec — when in doubt, the code is the source of truth._

---

## 1. What we're building

**LilSteps** is a React Native (Expo) pediatric health companion app for parents in India. It acts as a digital front door to pediatric care.

**Core loop (the business model):**

```
parent opens app
  → AI-guided health check-in collects structured symptoms
  → AI generates a pre-consult medical summary
  → parent books an appointment with a doctor
  → doctor reads summary BEFORE the visit
  → in-clinic consultation runs faster and better-prepared
```

Beyond the check-in loop, the app is a long-term child health record: growth tracking, vaccination schedule, allergies/conditions, and a journal of health notes. The doctor side is a **separate web portal** (out of scope for this codebase).

**Target users:** parents of children aged 0–15 in India. Onboarding splits into three age groups (0–2, 3–8, 9–15) which then refine into 9 runtime brackets (see §5).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Expo SDK 54** + React Native 0.81.5 | New Architecture enabled, React Compiler experimental flag on |
| Language | **TypeScript** strict mode | path alias `@/*` → project root |
| Routing | **expo-router 6** (file-based) | typed routes enabled |
| State | React Context | `AuthProvider`, `ChildProvider`, `OnboardingProvider` (see `context/`) |
| Backend | **Supabase** (`@supabase/supabase-js` 2.99.3) | OTP auth + Postgres + RLS expected |
| Auth storage | `expo-secure-store` with manual chunking | iOS 2KB SecureStore limit → JWT chunked across keys |
| AI | **Groq** (`llama-3.3-70b-versatile`) | called direct from client; MVP-only, must move to Edge Function before prod |
| Fonts | Plus Jakarta Sans (body) + Instrument Serif (display) | loaded via `@expo-google-fonts/plus-jakarta-sans` |
| UI primitives | `heroui-native` + custom components in `components/` | Tailwind config present (`global.css`, `tailwindcss` v4) but most styling uses RN `StyleSheet` |
| Animations | `react-native-reanimated` 4 + `react-native-worklets` | |
| Charts | _none yet_ | Growth screen needs Victory Native or chart-kit (see §4) |

**Platforms targeted:** iOS, Android, Web (single codebase, `.web.ts`/`.ios.tsx` for platform-specific overrides).

---

## 3. What's been built ✅

### 3.1 Auth + foundation
- `lib/supabase.ts` — Supabase client with chunked SecureStore adapter (handles JWT >2KB on iOS), web `localStorage` fallback, hardened env-var check (throws clear error if missing)
- `lib/groq.ts` — chat completion + structured summary generator with system prompt, `[CHECKIN_COMPLETE]` and `[QUICK_OPTIONS:...]` markers, JSON extraction with code-fence fallback
- `lib/debug.ts` — namespaced debug logger
- `context/auth.tsx` — OTP sign-in/verify, session restore, `hasChildren` gate, `ensureParentRow` upsert fallback if DB trigger fails
- `context/child.tsx` — active child selector
- `context/onboarding.tsx` — multi-step onboarding state

### 3.2 Screens (routed and working)

**Splash + auth**
- `app/index.tsx` — splash, auth-aware routing
- `app/(auth)/login.tsx`, `signup.tsx` — OTP flow (email-based — note: brief originally said phone, code is email)

**Onboarding** (`app/(onboarding)/`) — **fully built, 18 routes**
- `parent-details`, `child-basics`, `physical`, `allergies`, `conditions`, `confirm`, `complete`, `add-child`
- 0–2 yr branch: `a-birth-history`, `a-feeding`, `a-milestones`, `a-vaccination`, `a-sleep`
- 3–8 yr branch: `b-development`, `b-diet-activity`, `b-sleep-dental`, `b-vaccination`
- 9–15 yr branch: `c-academic`, `c-diet`, `c-puberty`, `c-mental-health`, `c-sleep`, `c-vaccination`

**Main tabs** (`app/(tabs)/`) — all 5 routes exist
- `index.tsx` (Home), `growth.tsx`, `vaccine.tsx`, `consult.tsx`, `records.tsx`
- `_layout.tsx` — custom bottom nav with bracket-conditional Vaccine/Consult tab and elevated center AI button

**Home** (`components/home/`) — modular, fully-wired
- `HomeHeader`, `PrimaryCtaCard`, `QuickActions`, `AllergyBanner`, `GrowthCards`, `VaccinationCard`, `CareTeam`, `DailyInsight`, `HealthTip`

**AI check-in flow** (`app/checkin/`)
- `index.tsx` — Stage 1 symptom entry
- `chat.tsx` — Stage 2 AI conversation (real Groq calls via `useCheckin`)
- `summary.tsx` — Stage 3 summary + booking entry

**Consult flow** (`app/consult/`) — **richer than the original brief**
- `[id].tsx`, `booking.tsx`, `confirm.tsx`, `describe.tsx`, `payment.tsx`, `slots.tsx`
- Payment route exists — out of scope in original brief, present in code

**Other**
- `app/health-log/index.tsx` — log a health note
- `app/profile/index.tsx` — child profile view/edit
- `app/records/[id].tsx`, `records/upload.tsx` — record viewer + upload

### 3.3 Reusable components (`components/`)
`AppLogo`, `GradientBackground`, `GradientButton`, `GlassCard`, `AvatarStack`, `TextInputField`, `ChipGroup`, `OnboardingShell`, `TabScreenLayout`

### 3.4 Data hooks (`hooks/`) — Supabase-backed
`useChildren`, `useAppointments`, `useConsultations`, `useDoctors`, `useDocuments`, `useGrowth`, `useHealthNotes`, `useVaccinations`, `useCheckin` (the Groq orchestrator)

### 3.5 Design system + constants
- `DESIGN.md` — design philosophy doc
- `constants/theme.ts` — `AppColors` (Material Design 3 tokens)
- `constants/bracketConfig.ts` — bracket-specific copy/config
- `styles/global.ts` — typography + layout presets
- `screens/` — HTML + PNG reference designs per screen (auth source of truth for visuals)

---

## 4. What's NOT built / partially built ⚠️

### 4.1 Growth screen — chart missing
`app/(tabs)/growth.tsx` exists but `components/growth/` does **not**. Specifically missing:
- `GrowthChart.tsx` with WHO percentile bands (3rd/15th/50th/85th/97th)
- `MeasurementHistory.tsx` (date, weight, height, trend arrow)
- `LogMeasurementSheet.tsx` (bottom sheet)
- A charting library is **not yet installed** — pick one (Victory Native XL recommended for Expo + RN 0.81 + new arch)
- Bracket-specific behaviour: length-for-age vs height-for-age, BMI tab for PRESCHOOL+
- Empty state for new users

### 4.2 Consult screen — sub-components
`app/(tabs)/consult.tsx` exists but `components/consult/` directory is **not present**. Missing:
- `AppointmentCard.tsx`, `DoctorCard.tsx`, `ConsultHistoryItem.tsx`
- The 6 `app/consult/*.tsx` routes need their UI verified against the brief (especially `payment.tsx` — not in original spec)

### 4.3 Check-in flow — sub-components
`components/checkin/` directory does **not exist**. Missing:
- `ComplaintChips.tsx` (bracket-specific suggested complaints)
- `ChatBubble.tsx`, `SummaryCard.tsx`, `SlotPicker.tsx`

### 4.4 Health-log screen — sub-components
`components/health-log/` directory does **not exist**. Missing:
- `CategoryChips.tsx`, `SeverityDots.tsx`
- Photo attachment via `expo-image-picker`
- Category-aware placeholder text in the notes field

### 4.5 Records / Vaccinations
Routes exist; need a code-level QA pass against the brief — recent commits (`3d27b7d`, `67dced7`) refactored these toward `TabScreenLayout` + `ListGroup`/`Menu` but completeness isn't audited.

### 4.6 Backend / data correctness
- Supabase **schema, RLS policies, and `handle_new_user` trigger** are referenced in code but not present in this repo — they live in the Supabase project
- No migrations folder. Schema is implicit. Worth dumping current schema + RLS into `supabase/migrations/` for source-control.
- `mock/data.ts` exists alongside real Supabase — it's unclear which screens still hit mocks vs live data; needs an audit

### 4.7 Production hardening
- Groq API key is **client-side** (`EXPO_PUBLIC_GROQ_API_KEY`) — `lib/groq.ts:5-7` already flags this. Move to a Supabase Edge Function before launch.
- No error boundaries
- No analytics, no crash reporting
- No automated tests

### 4.8 Doctor portal
Out of scope here — separate web app.

---

## 5. Critical architectural concepts (don't break these)

### 5.1 Age bracket system
**Age is never stored. It's computed from DOB on every render.** Bracket utilities live in the codebase (`constants/bracketConfig.ts` + helpers); the bracket recomputes on screen mount, so a child transitions automatically between brackets without any migration step.

```
NEWBORN        0–3 mo
EARLY_INFANT   3–6 mo
INFANT         6–12 mo
TODDLER_EARLY  12–18 mo
TODDLER        18 mo–3 yr
PRESCHOOL      3–5 yr
SCHOOL_EARLY   5–8 yr
SCHOOL_MID     8–12 yr
ADOLESCENT     12–15 yr
```

The bracket drives: home content, AI questions, suggested complaints, recommended activities, **which bottom-nav tab is shown**, and which onboarding fields are editable.

### 5.2 Bottom navigation rule (product-critical)
```
Bracket NEWBORN..PRESCHOOL  → Home | Growth | [AI] | Vaccine  | Records
Bracket SCHOOL_EARLY..ADOLESCENT → Home | Growth | [AI] | Consult | Records
```
The center AI button is **always present** and is the most important navigation element in the app. Tapping it from any screen jumps to `/checkin`. If a parent has two children of different age groups, the nav re-renders when they switch active child.

### 5.3 Screen reference rule (from CLAUDE.md)
Every screen has a folder under `screens/<ScreenName>/` with `reference.html` + `reference.png`. Those are the visual source of truth. Always check both before implementing or editing a screen, and follow `DESIGN.md` for tokens.

### 5.4 Component & style rules
- **No inline reusable UI** — anything that could be reused must live in `components/`
- Screen files in `app/` should be thin compositions
- Global styles in `styles/global.ts`, screen-specific styles co-located at the bottom of each screen file
- Never duplicate `fontFamily`/`fontSize`/`color` — promote to `constants/theme.ts` or `styles/global.ts`

### 5.5 SecureStore chunking
JWTs from Supabase can exceed iOS SecureStore's 2KB limit. `lib/supabase.ts` chunks values at 1800 bytes with a `__chunked__:N` marker key. **Don't replace this adapter with a naive one** — auth will silently break on real iOS sessions.

---

## 6. Important things to note 🔑

### 6.1 Environment variables
Required in `.env` at project root:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_GROQ_API_KEY=...
```
- `.env` is gitignored
- Expo bundles `EXPO_PUBLIC_*` vars **at build time** — after editing `.env` you must restart with `npx expo start -c` (the `-c` clears Metro cache, otherwise old values stay baked in)
- `lib/supabase.ts` now throws a clear error on missing vars instead of producing confusing "Network request failed"

### 6.2 Supabase project lifecycle gotcha
Free-tier Supabase projects **auto-pause after ~7 days idle**, and a paused project's hostname stops resolving via DNS. The app then shows `TypeError: Network request failed` everywhere. If that happens: open the dashboard, click **Restore**, wait ~2 minutes. (This is what happened today, 2026-05-03.)

### 6.3 New `sb_publishable_...` key format
The anon key in this project uses Supabase's new publishable-key format (`sb_publishable_...`) rather than the legacy JWT anon key. Supported from `@supabase/supabase-js` 2.40+. Do **not** swap for an `sb_secret_...` key — that's the service-role-equivalent and must never ship in a client.

### 6.4 OTP flow uses email, not phone
The original brief said phone-OTP. The code uses **email-OTP** (`supabase.auth.signInWithOtp({ email })` in `context/auth.tsx:89`). If phone is needed for the India launch, that's a meaningful change — Supabase phone-OTP requires a Twilio (or similar) SMS provider configured in the Supabase dashboard.

### 6.5 Groq client-side key
`EXPO_PUBLIC_*` vars are exposed in the JS bundle — anyone who downloads the app can extract the Groq key. Acceptable for MVP; **must move to Supabase Edge Function before public launch.** `lib/groq.ts:5-7` already documents this.

### 6.6 Mixed mock + live data
`mock/data.ts` exists. Real data hooks in `hooks/` exist. It's not currently obvious which screens still read from `mock/` — worth a sweep before claiming any screen is "done."

### 6.7 React new architecture + React Compiler
Both are enabled (`app.json`). This means: every dependency must support the new arch (most modern ones do), and the experimental React Compiler will auto-memoize components. **Don't manually `useMemo`/`useCallback` aggressively** — the compiler handles it. But also: any compile-time bug surfaces here, not at runtime.

### 6.8 No native folders committed
`/ios` and `/android` are gitignored. The project relies on **Expo prebuild** if/when a custom dev client or native module is needed. Don't manually create those folders.

### 6.9 Path alias
`@/*` maps to project root. Use `@/lib/...`, `@/components/...`, `@/hooks/...` everywhere — not relative `../../`.

---

## 7. Running the app

```bash
# install
npm install

# create .env with the 3 EXPO_PUBLIC_* vars (see §6.1)

# start (clear Metro cache after env changes)
npx expo start -c

# platform-specific
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # browser

# lint
npm run lint
```

---

## 8. Suggested next moves (priority order)

1. **Audit mock vs live data** — confirm which screens still read `mock/data.ts` and migrate to Supabase hooks
2. **Build the Growth chart** — pick Victory Native XL, install, build `GrowthChart` + `MeasurementHistory` + `LogMeasurementSheet`
3. **Extract check-in sub-components** (`ComplaintChips`, `ChatBubble`, `SummaryCard`, `SlotPicker`) per the no-inline-reusable-UI rule
4. **Extract consult sub-components** (`AppointmentCard`, `DoctorCard`, `ConsultHistoryItem`)
5. **Dump Supabase schema + RLS** into a `supabase/migrations/` folder for source-control
6. **Move Groq calls behind a Supabase Edge Function** before any external launch
7. **Decide email-OTP vs phone-OTP** for the India market and update auth accordingly
