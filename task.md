# LilSteps — Execution Plan

---

## Phase 0 — Foundation (do first, everything depends on it)

**0.1 — Mock data file**
- [ ] Create `mock/data.ts` — typed interfaces + mock objects for: child profile, appointment list, consultation history, growth measurements, vaccination schedule, doctor list, AI conversation turns
- [ ] Add `AgeBracket` type re-export so mock data references it properly

**0.2 — Fix bottom nav (bracket-conditional)**
- [ ] Rewrite `app/(tabs)/_layout.tsx` custom tab bar to accept bracket as a computed prop
- [ ] Implement bracket logic: brackets `NEWBORN→PRESCHOOL` → show **Vaccine** tab; `SCHOOL_EARLY→ADOLESCENT` → show **Consult** tab
- [ ] Build elevated center AI button (52×52, border-radius 16, purple, sparkle icon, elevated shadow)
- [ ] Wire active child's bracket to drive which tabs render
- [ ] Remove current placeholder `vaccine.tsx` route and add `consult.tsx` route conditionally

---

## Phase 1 — Growth Screen (`app/(tabs)/growth.tsx`)

**1.1 — Current measurements card**
- [ ] Weight + height in large text with last-measured date
- [ ] Subtle "Update" link on right side
- [ ] BMI row — conditional: only shown for children over 2 years (TODDLER and above)

**1.2 — Chart component**
- [ ] Install and evaluate `victory-native` for Expo compatibility — document choice at top of file
- [ ] Build `components/growth/GrowthChart.tsx` — line chart with WHO percentile bands (3rd, 15th, 50th, 85th, 97th as shaded regions), child's data points in primary purple
- [ ] Tab switcher above chart: **Weight** / **Height** / **BMI** (BMI tab only for PRESCHOOL+)
- [ ] Time filter below chart: **3M / 6M / 1Y / All**
- [ ] Percentile badge: "Arav is at the 65th percentile for weight" — updates per active chart tab

**1.3 — Measurement history list**
- [ ] Build `components/growth/MeasurementHistory.tsx` — date, weight, height, trend arrow (↑↓ vs previous entry)
- [ ] Last 5–6 entries, no tap action for MVP

**1.4 — Log measurement bottom sheet**
- [ ] Build `components/growth/LogMeasurementSheet.tsx`
- [ ] Weight field (numeric, decimal), height field (numeric), date picker (defaults today), optional note
- [ ] "Save measurement" button — optimistic update to chart and history list

**1.5 — Bracket-specific behaviour**
- [ ] `NEWBORN` / `EARLY_INFANT` — show "length-for-age" label with explanatory note about lying-down measurement
- [ ] Empty state — no measurements yet: placeholder + "Log first measurement" CTA

---

## Phase 2 — Consult Screen (`app/(tabs)/consult.tsx`)

*Only visible for SCHOOL_EARLY, SCHOOL_MID, ADOLESCENT*

**2.1 — Upcoming appointment card**
- [ ] Build `components/consult/AppointmentCard.tsx` — doctor name, date/time, clinic, "View summary" link, "Cancel" option
- [ ] Empty state: "No upcoming appointments" invite card + "Start check-in" CTA → routes to `/checkin`

**2.2 — Your doctors row**
- [ ] Build `components/consult/DoctorCard.tsx` — avatar initials, name, specialisation, hospital, "Book" pill
- [ ] Horizontal scrollable `FlatList`, 2–3 hardcoded pilot doctors from mock data
- [ ] "Book" pill → routes to `/consult/booking`

**2.3 — Consultation history list**
- [ ] Build `components/consult/ConsultHistoryItem.tsx` — date, doctor, chief complaint, outcome, chevron
- [ ] 3–5 mock entries
- [ ] Empty state for new users
- [ ] Tap → routes to `/consult/detail/[id]`

**2.4 — Booking flow (`app/(tabs)/consult/booking.tsx`)**
- [ ] Step 1 — doctor selection list
- [ ] Step 2 — horizontal date strip (today + 6 days)
- [ ] Step 3 — time slot grid (some greyed/unavailable)
- [ ] Step 4 — confirmation screen with all details + "Confirm booking" button
- [ ] After confirm → return to consult tab with appointment card visible (update mock state)

**2.5 — Consultation detail screen (`app/(tabs)/consult/detail/[id].tsx`)**
- [ ] Full AI summary, doctor notes, prescription section
- [ ] Back navigation to consult tab

---

## Phase 3 — AI Check-in Flow

**3.1 — Stage 1: Symptom entry (`app/checkin/index.tsx`)**
- [ ] Header: "What's going on with [name] today?" in serif font
- [ ] Auto-focused large free-text input
- [ ] Bracket-specific complaint chips (wrapping row) — all 4 bracket groups from brief
- [ ] Chip tap → appends text to input (not replace)
- [ ] Info line: "Arav's profile and history are loaded — the AI already knows his details."
- [ ] "Start check-in →" button — disabled until input has ≥ 3 characters
- [ ] On press → navigate to `/checkin/chat` passing complaint text

**3.2 — Stage 2: AI conversation (`app/checkin/chat.tsx`)**
- [ ] Top bar: back, "AI Check-in — [name]", child stats subtitle, "Profile loaded ✓" pill
- [ ] Chat UI — AI messages left (sparkle avatar), parent messages right (purple bubbles)
- [ ] Load 3–4 pre-written mock conversation turns from `mock/data.ts`
- [ ] Simulate typing delay: 800–1200ms `setTimeout` before each AI message appears
- [ ] Progress bar above input: "Question 3 of ~7"
- [ ] Final AI message with two tappable chips: "Yes, generate summary" / "I have more to add"
- [ ] "Yes, generate summary" → 2–3 second pulsing loading state → navigate to `/checkin/summary`

**3.3 — Stage 3: Summary + booking (`app/checkin/summary.tsx`)**
- [ ] Summary card — purple left border, chief complaint, key detail list, relevant history (amber bg), allergy reminder (red), "Sent to Dr. Ramesh ✓" line
- [ ] Doctor card below
- [ ] Date strip (today + 6 days)
- [ ] Time slot grid
- [ ] "Confirm appointment" button
- [ ] Success screen — green checkmark, appointment details, "Add to calendar" + "Done" buttons
- [ ] "Done" → `router.replace('/(tabs)')` with new appointment visible on home screen

---

## Phase 4 — Log Health Note (`app/health-log/index.tsx`)

- [ ] Header: "Log a health note for [name]" with back button
- [ ] Category chip row: General / Symptom / Medication given / Reaction / Injury / Mood / Other
- [ ] Date/time selector pill — defaults to now, tappable
- [ ] Large multiline notes field — placeholder text changes per selected category
- [ ] Severity dots (1–5, green → red) — conditional: only for Symptom and Injury categories
- [ ] Photo attachment placeholder — camera icon, tap opens picker, thumbnail on selection
- [ ] "Save note" button — disabled until notes field has content
- [ ] Success state — "Note saved" with "View history" link + "Done" button

---

## Phase 5 — Navigation wiring

- [ ] Wire home screen "History" chip → `/health-log`
- [ ] Wire home screen primary CTA card → `/checkin`
- [ ] Wire bottom nav center button → `/checkin` from any tab
- [ ] Wire consult tab "Start check-in" empty state → `/checkin`
- [ ] Wire growth tab "Update" link → log measurement sheet
- [ ] Wire consult "Book" pills → `/consult/booking`
- [ ] Wire consult history items → `/consult/detail/[id]`
- [ ] Ensure all success screens return correctly (replace vs push)
- [ ] Register all new routes in `app/_layout.tsx` Stack

---

## Phase 6 — Polish & QA

- [ ] Keyboard avoiding on all form screens (symptom entry, health log, log measurement)
- [ ] All `ScrollView`s use `keyboardShouldPersistTaps="handled"`
- [ ] Fade-up entry animation on all new screens (opacity 0→1, translateY 8→0, 300ms)
- [ ] Active press states on all tappable elements (scale 0.96–0.98, 150ms)
- [ ] Empty states built for every list in the app
- [ ] No dead-end navigation — every screen has a back path
- [ ] Verify bracket transitions: switching between a child under 5 and over 5 updates the bottom nav tabs

---

## New files to create

```
mock/
  data.ts                          ← all mock data, typed

app/
  checkin/
    index.tsx                      ← Stage 1: symptom entry
    chat.tsx                       ← Stage 2: AI conversation
    summary.tsx                    ← Stage 3: summary + booking
  health-log/
    index.tsx                      ← log health note
  (tabs)/
    consult.tsx                    ← consult tab (age 5+)
    consult/
      booking.tsx                  ← booking flow
      detail/
        [id].tsx                   ← consultation detail

components/
  growth/
    GrowthChart.tsx
    MeasurementHistory.tsx
    LogMeasurementSheet.tsx
  consult/
    AppointmentCard.tsx
    DoctorCard.tsx
    ConsultHistoryItem.tsx
  checkin/
    ComplaintChips.tsx
    ChatBubble.tsx
    SummaryCard.tsx
    SlotPicker.tsx
  health-log/
    CategoryChips.tsx
    SeverityDots.tsx
```

---

## Existing files to modify

```
app/(tabs)/_layout.tsx             ← bracket-conditional tab bar + center AI button
app/(tabs)/growth.tsx              ← full rebuild (currently stub)
app/(tabs)/vaccine.tsx             ← keep for under-5; conditionally hidden for 5+
app/(tabs)/index.tsx               ← wire CTAs to real routes
app/_layout.tsx                    ← register checkin/health-log routes in Stack
constants/bracketConfig.ts         ← add complaint chips per bracket (Stage 1)
```

---

## Suggested build order

```
Phase 0 → Phase 1 → Phase 3.1–3.2 → Phase 3.3 → Phase 2 → Phase 4 → Phase 5 → Phase 6
```

Start with mock data and nav (Phase 0) because every screen depends on it. Build Growth next (Phase 1) — it's self-contained and the most visual. Then the AI check-in flow (Phase 3) — it's the app's core feature. Consult (Phase 2) after since it shares the booking UI with check-in summary. Health log (Phase 4) is the simplest. Wire everything in Phase 5, polish in Phase 6.
