Here's your Claude Code prompt:

---

**PROJECT: LilSteps — Pediatric Health Companion App**

**ROLE & CONTEXT**

You are continuing development on LilSteps, a React Native (Expo) pediatric health app for parents in India. The app acts as a digital front door to pediatric care — it collects structured symptom information through AI-guided conversations before doctor consultations, tracks child growth and vaccinations, and surfaces age-appropriate developmental activities to engage parents daily.

The business model is: parent uses the app to do an AI-guided health check-in → AI generates a structured medical summary → parent books an appointment → doctor reviews the summary before the consultation → consultation happens more efficiently. The doctor side is a separate web portal (not part of this prompt).

---

**WHAT HAS ALREADY BEEN BUILT**

The following screens are complete and working. Do not touch or rebuild these. Understand them so your new screens are consistent.

**Splash screen** — branded loading screen, checks auth token, routes to login or home.

**Login / Signup** — OTP-based authentication. Phone number entry → OTP verification → routes to onboarding if new user, home if returning user. No email, no password.

**Onboarding flow** — multi-step child profile creation with age-bracket-aware field schemas. Collects: parent details, child basics (name, DOB, sex), physical measurements (weight, height, blood group), allergies (dedicated screen — medication, food, environmental), chronic conditions and medications, then bracket-specific fields. Three brackets at onboarding: 0–2 years (infant fields: birth history, feeding, milestones, vaccination status, sleep), 3–8 years (development, diet, activity, dental, sleep), 9–15 years (academic stress, puberty, mental health optional, vaccination including HPV). Ends with a profile confirmation card where parent accepts terms and confirms accuracy.

**Home screen** — dynamic screen driven by the child's age bracket (9 brackets: NEWBORN, EARLY_INFANT, INFANT, TODDLER_EARLY, TODDLER, PRESCHOOL, SCHOOL_EARLY, SCHOOL_MID, ADOLESCENT). Contains: fixed top nav with child selector pill, app logo, notification bell. Scrollable content with greeting block, conditional allergy banner, primary CTA card (Start health check-in), quick actions row (Book / Growth / Vaccines / History), two-column info cards (next appointment + last visit), smart insight card (dynamically resolved from priority list based on real data), today's activity card (bracket-specific), recent activity timeline. Fixed bottom nav with 5 tabs.

**Profile screen** — displays and allows editing of the child's profile. Shows all fields collected during onboarding organised into sections. Allows updating weight/height, medications, and conditions. Has a child switcher if multiple children exist and an "Add child" flow.

---

**THE AGE BRACKET SYSTEM — READ THIS CAREFULLY**

This is the most important architectural concept in the app. Every new screen you build must understand and respect this system.

Age is never stored. It is always computed from date of birth at runtime:

```
Age in months = (current year - birth year) × 12 + (current month - birth month)

NEWBORN        0–3 months
EARLY_INFANT   3–6 months
INFANT         6–12 months
TODDLER_EARLY  12–18 months
TODDLER        18 months–3 years
PRESCHOOL      3–5 years
SCHOOL_EARLY   5–8 years
SCHOOL_MID     8–12 years
ADOLESCENT     12–15 years
```

The bracket is recomputed on every screen mount. A child transitions between brackets automatically — no migration, no manual update needed.

The bracket drives: what content is shown, what questions the AI asks, what activities are recommended, what navigation items appear, and what fields are editable.

---

**BOTTOM NAVIGATION — CRITICAL RULE**

The bottom navigation has a bracket-conditional tab. This is a core product decision:

```
Children under 5 years (NEWBORN through PRESCHOOL):
Home | Growth | [Center AI button] | Vaccine | Records

Children 5 years and above (SCHOOL_EARLY through ADOLESCENT):
Home | Growth | [Center AI button] | Consult | Records
```

The Vaccine tab replaces the Consult tab for younger children because vaccination tracking is the primary healthcare action for that age group. For older children, direct consultation booking becomes more relevant than vaccination tracking.

The center elevated button is always present regardless of bracket. It is a rounded purple square elevated above the nav bar, containing a sparkle icon. Tapping it from any screen immediately opens the AI check-in flow. This is the most important navigation element in the entire app.

The navigation tab switch happens silently and automatically when the bracket changes — parents never configure this manually. If a family has two children (one under 5, one over 5) and switches between them using the child selector, the bottom nav updates to reflect the active child's bracket.

Implementation note: do not use the default React Navigation tab bar for this. Build a custom bottom navigation component that accepts the bracket key as a prop and renders the correct tabs. This gives you full control over the elevated center button, the conditional tab logic, and the active state styling.

---

**DESIGN SYSTEM — MATCH THE EXISTING SCREENS**

All new screens must be visually consistent with what has already been built. The existing design uses:

Typography: Instrument Serif for display headings and the app logo. Plus Jakarta Sans for all body text, labels, and UI elements. Never use Inter, Roboto, or system fonts.

Colour palette:
- Primary purple: #7C3AED
- Purple light: #9F67F7
- Purple background: #F5F3FF
- Purple card: #EDE9FE
- Screen background: #F0EEFF (light lavender)
- Card background: #FFFFFF
- Green: #16A34A, green bg: #F0FDF4, green border: #BBF7D0
- Amber: #D97706, amber bg: #FFFBEB
- Red: #DC2626, red bg: #FFF5F5
- Dark text: #1A1A2E
- Mid text: #4B5563
- Muted text: #9CA3AF
- Border: #F0EDFF

Component patterns already established:
- Cards: white background, 1px border using border colour, border-radius 16–20px
- Section labels: 14px, weight 600, dark colour, margin-bottom 10px
- Chips and pills: border-radius 40px for pills, 14px for chips
- Primary action cards: purple gradient background with white text, box shadow with purple tint
- Green activity cards: #F0FDF4 background, #BBF7D0 border
- Conditional coloured cards: amber/red/green/blue/teal/purple based on card type
- Bottom nav: white background, 1px top border, 83px height including home indicator safe area
- The elevated center button: 52×52px, border-radius 16px, #7C3AED background, elevated with shadow

Spacing: horizontal padding 20px on all screens. Gap between sections 16px. Gap between cards in a grid 10px.

Animation: subtle fade-up on screen content load (opacity 0→1, translateY 8px→0, 300ms ease). Active states use scale(0.96–0.98) with 150ms transition. No jarring animations.

---

**WHAT TO BUILD NOW — FRONTEND ONLY**

Build the following four screens using mock/hardcoded data. No backend integration yet. No API calls. Use static mock data objects that mirror the shape the real API will eventually return. The mock data should be realistic and complete enough to show all states of each screen.

---

**SCREEN 1 — CONSULT SCREEN**

This screen is the tab that appears for children aged 5 and above (SCHOOL_EARLY through ADOLESCENT). It is the consultation booking and management hub.

What this screen contains:

Top section — upcoming appointment card if one exists. Shows doctor name, date and time, clinic name, a "View summary" link (tapping opens the pre-consult summary the AI generated), and a "Cancel" option. If no appointment exists, shows an invitation card: "No upcoming appointments — book one after a health check-in" with a "Start check-in" CTA that routes to the AI check-in flow.

Second section — "Your doctors" horizontal scrollable row. Each doctor card shows: circular avatar with doctor's initials, doctor's full name, specialisation (Pediatrician / General Physician), hospital name, and a "Book" pill button. For the MVP this is a hardcoded list of 2–3 doctors associated with the pilot hospital. Tapping "Book" routes to the slot selection flow.

Third section — consultation history list. Each entry shows: date, doctor name, chief complaint (one line), outcome/diagnosis (one line), and a "View details" chevron. Tapping opens a consultation detail bottom sheet or screen showing the full AI-generated summary, doctor's notes, and prescription if issued. Show 3–5 mock entries. Include an empty state for new users.

Fourth section — "Book a consultation" CTA at the bottom if no appointment is booked. Large purple button that opens the booking flow.

Booking flow (can be a bottom sheet or full screen — choose what feels right): Step 1 — select doctor from the list. Step 2 — select date from a horizontal date strip (today + next 6 days). Step 3 — select time slot from a grid of available times (show some as unavailable/greyed). Step 4 — confirmation screen showing all details with a "Confirm booking" button. After confirming, return to the consult screen with the new appointment card visible.

States to design: no appointment + no history (first time user), has upcoming appointment + history, booking flow in progress.

---

**SCREEN 2 — GROWTH SCREEN**

This screen tracks the child's height and weight over time and shows growth percentile curves. It appears for all brackets.

What this screen contains:

Top section — current measurements card. Shows current weight (kg) and height (cm) in large text. Below each: the last measured date. A subtle "Update" link on the right. Current BMI shown below if child is over 2 years.

Second section — growth chart. This is the centrepiece of the screen. Display a line chart showing the child's weight-for-age OR height-for-age curve plotted against WHO reference percentile bands (3rd, 15th, 50th, 85th, 97th). Use a tab switcher above the chart to toggle between Weight and Height. Use a time filter below the chart: 3M / 6M / 1Y / All. The chart should show the child's actual data points connected by a line, overlaid on shaded percentile bands. Use a charting library — Victory Native or react-native-chart-kit or Recharts via WebView — choose the most appropriate for React Native Expo. Colour the child's line in the primary purple. Make the chart clean and readable, not cluttered. Show a percentile badge: "Arav is at the 65th percentile for weight" — update this dynamically based on which chart is showing.

Third section — measurement history list. Each entry: date, weight, height, and a small trend arrow (up/down from previous). Show the last 5–6 entries. Tapping an entry shows no action for MVP.

Fourth section — "Log new measurement" button. Fixed at the bottom of the screen (not floating — part of the scroll flow). Tapping opens a bottom sheet with two fields: weight (kg, numeric input with decimal) and height (cm, numeric input), a date picker defaulting to today, an optional note field, and a "Save measurement" button. After saving, the chart and history update optimistically.

Age-bracket specific behaviour: for NEWBORN and EARLY_INFANT, show weight-for-age and length-for-age (lying down, not standing height). Add a note explaining the difference. For INFANT through TODDLER_EARLY, keep both charts. For PRESCHOOL and above, show BMI-for-age as a third chart option in the tab switcher.

Empty state: child has no measurements logged yet. Show an inviting illustration placeholder with text "Start tracking [name]'s growth — log the first measurement" and a large "Log first measurement" CTA.

---

**SCREEN 3 — LOG HEALTH UPDATE**

This is a lightweight screen accessible from the quick actions row on the home screen (the "History" chip or a dedicated entry point). It allows parents to log a health note without going through the full AI intake — for minor observations they want to record.

Think of this like a health journal entry. Not a medical consultation. Not an AI intake. Just a quick log.

What this screen contains:

It opens as a full screen (not a bottom sheet — needs more space).

Header: "Log a health note for [child name]" with a close/back button.

Entry type selector — a horizontal chip row letting the parent categorise the note. Categories: General observation / Symptom noted / Medication given / Reaction / Injury / Mood / Other. Selecting a category changes the placeholder text in the notes field to be contextually appropriate.

Date and time selector — defaults to right now. Tappable to change. Shows as "Today at 2:34pm" in a subtle pill.

Notes field — large multiline text input. Placeholder text changes based on category selected. Examples: General observation → "e.g. Arav seemed tired today, napped longer than usual." Symptom noted → "e.g. Noticed a mild rash on left arm, no fever." Medication given → "e.g. Given half a Calpol tablet at 3pm for mild fever."

Severity selector — only shown for Symptom and Injury categories. A 1–5 scale shown as coloured dots (green to red). Label: "How concerning does this seem to you?"

Photo attachment — optional. A tappable placeholder showing a camera icon and "Add a photo (optional)". Opens device camera or gallery. Shows thumbnail preview if photo is added.

Save button — "Save note" — large purple button at the bottom. After saving, shows a success state: "Note saved to [child name]'s health record" with a "View history" link and a "Done" button that closes the screen.

This note then appears in the health history timeline on the home screen and in the Records tab.

---

**SCREEN 4 — AI CHECK-IN FLOW**

This is the most important flow in the entire app. It is triggered from three places: the primary CTA card on the home screen, the elevated center button in the bottom nav, and the "Start check-in" CTAs on empty states.

The flow has three stages: symptom entry, AI conversation, and summary + booking.

**Stage 1 — Symptom entry screen**

Full screen. Warm, not clinical.

Header shows child's name and age prominently: "What's going on with Arav today?" in serif font.

Large free-text input in the centre — the primary interaction. Placeholder: "Describe what you're noticing..." The input is auto-focused when the screen opens.

Below the input — suggested complaint chips in a wrapping row. These are bracket-specific:

```
NEWBORN / EARLY_INFANT: Feeding issue / Excessive crying / Rash / Fever / Breathing concern / Not sleeping
INFANT / TODDLER_EARLY: Fever / Ear pain / Runny nose / Rash / Vomiting / Diarrhoea / Not eating
TODDLER / PRESCHOOL: Fever / Stomach ache / Cold and cough / Ear pain / Rash / Vomiting / Headache / Injury
SCHOOL_EARLY and above: Fever / Headache / Stomach pain / Cold / Sore throat / Rash / Injury / Fatigue / Other
```

Tapping a chip populates the text input with that complaint. Parent can then add more detail. Chips are not exclusive — tapping another chip appends to the existing text.

A subtle info line below the chips: "Arav's profile and history are loaded — the AI already knows his details."

Bottom: large "Start check-in →" button. Disabled until the input has at least 3 characters.

**Stage 2 — AI conversation screen**

Full screen chat interface.

Top bar: back arrow, "AI Check-in — Arav" title, a small "9 years · 34kg" subtitle showing the child's key stats being used as context. A subtle purple pill badge: "Profile loaded ✓"

The conversation area fills the screen. AI messages appear on the left with a small LilSteps sparkle avatar. Parent messages appear on the right in purple bubbles.

The AI opens with a warm, context-aware message that references the child's name and the complaint. Example: "Back pain can be really uncomfortable. Let me ask a few quick questions so the doctor is fully prepared before you meet. Where exactly is the pain — upper back, lower back, or more towards the side?"

Show 3–4 pre-loaded mock conversation turns in the chat to illustrate the experience. The messages should feel natural, not clinical. One question at a time. The AI references the child's history naturally when relevant.

At the bottom: a text input with a send button. A subtle progress indicator above the input: "Question 3 of ~7" as a thin progress bar. This reassures parents the conversation has a defined end.

After the mock conversation, show a final AI message: "That's really helpful. I have everything I need to prepare a summary for the doctor. Shall I go ahead?" with two tappable options shown as large chips below the input: "Yes, generate summary" and "I have more to add."

Tapping "Yes, generate summary" triggers a loading state: the chat screen shows a gentle pulsing animation and text "Preparing Arav's summary..." for 2–3 seconds (simulated), then transitions to Stage 3.

**Stage 3 — Summary and booking screen**

This is a two-part screen: summary preview at top, booking below.

Summary card — white card with a purple left border accent. Shows:
- "Pre-consult summary" label in small purple uppercase text
- Chief complaint: "Lower back pain" — 18px, bold
- Key details in a clean list: When it started / Severity / What makes it worse / Associated symptoms
- A "Relevant history" section if the mock data includes past relevant visits — shown with a subtle amber background: "Note: Arav had abdominal pain in Jan 2025 — doctor may want to assess connection"
- Allergy reminder at the bottom of the card in red: "Allergy on file: Penicillin — flagged for doctor"
- A "This summary has been sent to Dr. Ramesh" confirmation line with a green checkmark

Below the summary card — booking section:
- "Book your appointment" section label
- Doctor card: avatar, name, designation
- Date strip: horizontal scrollable, today + next 6 days, each day showing available slot count
- Time slots grid: tappable chips, some available, some greyed
- "Confirm appointment" button — large purple

After confirming — success screen: a clean confirmation card showing all appointment details with a green checkmark, "Add to calendar" button, and "Done" button that returns to home screen with the new appointment visible.

---

**TECHNICAL REQUIREMENTS**

Use Expo and React Native. Use expo-router for navigation. Build a custom bottom navigation component — do not use the default React Navigation tab bar.

For the growth chart, evaluate and choose the most appropriate charting solution for Expo — consider Victory Native XL, react-native-chart-kit, or a WebView-based approach with Chart.js. Whichever you choose, document why at the top of the chart component file.

All mock data should be defined in a single file: `src/mock/data.ts`. This file exports typed mock objects for: child profile, appointment list, consultation history, growth measurements, vaccination schedule (for under-5), doctor list, and AI conversation mock turns. Using TypeScript interfaces that mirror what the real Supabase API will return.

The bracket utility functions (getAgeBracket, getAgeInMonths, getAgeDisplay) should live in `src/utils/ageUtils.ts` and be imported wherever needed. These are already implemented — do not rewrite them, import them.

The bottom nav component should live in `src/components/navigation/BottomNav.tsx`. It accepts activeTab and bracket as props and renders the correct tabs. The Vaccine tab appears only when bracket is one of: NEWBORN, EARLY_INFANT, INFANT, TODDLER_EARLY, TODDLER, PRESCHOOL. The Consult tab appears for: SCHOOL_EARLY, SCHOOL_MID, ADOLESCENT.

Use the existing design system — the colours, typography (Instrument Serif + Plus Jakarta Sans), spacing, and component patterns documented above. Every new screen must feel like it belongs in the same app as the existing screens.

For the AI conversation in Stage 2, the conversation is mock only — no real API call. Define the mock conversation turns in `src/mock/data.ts` as an array of message objects with role (user/assistant) and content. Simulate the typing delay with a setTimeout of 800–1200ms before each AI message appears. This creates the illusion of a real streaming response.

Handle all navigation using expo-router file-based routing. New routes needed:
- `/consult` — the consult tab screen
- `/consult/booking` — the booking flow
- `/consult/detail/[id]` — consultation detail
- `/growth` — the growth tab screen
- `/health-log` — the log health update screen
- `/checkin` — stage 1 symptom entry
- `/checkin/chat` — stage 2 AI conversation
- `/checkin/summary` — stage 3 summary and booking

Build all four screens and the check-in flow completely. Every state should be reachable by interacting with the UI — no dead ends, no placeholder screens. Empty states, loading states (simulated), success states, and error states (static, no real errors) should all be built.

Do not integrate any backend. Do not make any API calls. Do not set up Supabase. Use only the mock data from `src/mock/data.ts`.

When done, provide a summary of: every new file created, every existing file modified, any new dependencies added and why, and the complete navigation map showing how all screens connect.

---