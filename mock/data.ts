import type { AgeBracket } from '@/constants/bracketConfig';

// ─── Child Profile ────────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  name: string;
  dob: Date;
  sex: 'Male' | 'Female';
  bloodGroup: string;
  weight: number; // kg
  height: number; // cm
  weightUpdatedAt: string;
  heightUpdatedAt: string;
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  bracket: AgeBracket;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export const MOCK_CHILD: ChildProfile = {
  id: 'child-001',
  name: 'Arav',
  dob: new Date('2022-09-01'), // ~2.5y → TODDLER
  sex: 'Male',
  bloodGroup: 'B+',
  weight: 12.4,
  height: 84,
  weightUpdatedAt: 'Oct 12, 2024',
  heightUpdatedAt: 'Oct 12, 2024',
  allergies: ['Penicillin', 'Nuts'],
  conditions: ['Mild Asthma'],
  medications: [
    { name: 'Budecort Inhaler', dose: '100 mcg', frequency: '2x daily' },
  ],
  bracket: 'TODDLER',
};

export const MOCK_PARENT_NAME = 'Priya';

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialisation: string;
  hospital: string;
  initial: string;
  available: boolean;
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Sarah Miller',
    specialisation: 'Pediatrician',
    hospital: 'St. Jude\'s Pediatric Center',
    initial: 'SM',
    available: true,
  },
  {
    id: 'doc-002',
    name: 'Dr. Ramesh Gupta',
    specialisation: 'General Physician',
    hospital: 'Apollo Children\'s Clinic',
    initial: 'RG',
    available: true,
  },
  {
    id: 'doc-003',
    name: 'Dr. Emily Chen',
    specialisation: 'Developmental Pediatrician',
    hospital: 'City Health Clinic',
    initial: 'EC',
    available: false,
  },
];

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialisation: string;
  hospital: string;
  date: string;
  time: string;
  summaryReady: boolean;
}

export const MOCK_UPCOMING_APPOINTMENT: Appointment | null = {
  id: 'appt-001',
  doctorId: 'doc-001',
  doctorName: 'Dr. Sarah Miller',
  doctorSpecialisation: 'Pediatrician',
  hospital: 'St. Jude\'s Pediatric Center',
  date: 'Tomorrow',
  time: '10:30 AM',
  summaryReady: true,
};

// ─── Consultation History ─────────────────────────────────────────────────────

export interface ConsultationEntry {
  id: string;
  date: string;
  doctorName: string;
  chiefComplaint: string;
  outcome: string;
  prescription: string | null;
  aiSummary: AISummary;
}

export interface AISummary {
  chiefComplaint: string;
  details: { label: string; value: string }[];
  relevantHistory: string | null;
  allergyNote: string | null;
}

export const MOCK_CONSULTATION_HISTORY: ConsultationEntry[] = [
  {
    id: 'consult-001',
    date: 'Oct 12, 2024',
    doctorName: 'Dr. Sarah Miller',
    chiefComplaint: 'High fever for 2 days',
    outcome: 'Viral fever, symptomatic treatment prescribed',
    prescription: 'Calpol 250mg syrup, twice daily for 3 days',
    aiSummary: {
      chiefComplaint: 'High fever for 2 days',
      details: [
        { label: 'Started', value: '2 days ago' },
        { label: 'Severity', value: '103°F at peak' },
        { label: 'Associated symptoms', value: 'Mild cough, reduced appetite' },
        { label: 'What helps', value: 'Calpol, cool compress' },
      ],
      relevantHistory: null,
      allergyNote: 'Allergy on file: Penicillin — flagged for doctor',
    },
  },
  {
    id: 'consult-002',
    date: 'Aug 28, 2024',
    doctorName: 'Dr. Ramesh Gupta',
    chiefComplaint: 'Skin rash on arms',
    outcome: 'Allergic reaction, antihistamine prescribed',
    prescription: 'Cetirizine 2.5mg syrup, once daily',
    aiSummary: {
      chiefComplaint: 'Skin rash on arms',
      details: [
        { label: 'Started', value: '3 days ago' },
        { label: 'Area affected', value: 'Both forearms, slightly itchy' },
        { label: 'Possible trigger', value: 'New detergent used on clothes' },
        { label: 'Severity', value: 'Mild, no swelling' },
      ],
      relevantHistory: 'Known nut allergy — patch test recommended',
      allergyNote: 'Allergy on file: Penicillin, Nuts — flagged for doctor',
    },
  },
  {
    id: 'consult-003',
    date: 'Jun 5, 2024',
    doctorName: 'Dr. Sarah Miller',
    chiefComplaint: 'Routine 18-month checkup',
    outcome: 'All milestones on track, vaccinations updated',
    prescription: null,
    aiSummary: {
      chiefComplaint: 'Routine wellness check',
      details: [
        { label: 'Weight', value: '11.8 kg (50th percentile)' },
        { label: 'Height', value: '81 cm (55th percentile)' },
        { label: 'Milestones', value: 'Walking, 5–6 words, self-feeding' },
        { label: 'Vaccinations', value: 'MMR Dose 1, Varicella Dose 1' },
      ],
      relevantHistory: null,
      allergyNote: null,
    },
  },
];

// ─── Growth Measurements ──────────────────────────────────────────────────────

export interface GrowthEntry {
  date: string;
  weight: number; // kg
  height: number; // cm
  note?: string;
}

export const MOCK_GROWTH_HISTORY: GrowthEntry[] = [
  { date: 'Oct 2024', weight: 12.4, height: 84 },
  { date: 'Aug 2024', weight: 12.0, height: 82 },
  { date: 'Jun 2024', weight: 11.8, height: 81 },
  { date: 'Mar 2024', weight: 11.2, height: 78 },
  { date: 'Dec 2023', weight: 10.6, height: 75 },
  { date: 'Sep 2023', weight: 9.8, height: 71 },
];

// WHO 50th percentile reference points for weight-for-age (boys, 0–36 months, kg)
export const WHO_WEIGHT_P50 = [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 9.9, 10.1, 10.3, 10.5, 10.7, 10.9, 11.1, 11.3, 11.5, 11.8, 12.0, 12.2];
export const WHO_WEIGHT_P15 = [2.9, 3.9, 4.9, 5.7, 6.2, 6.7, 7.1, 7.4, 7.7, 8.0, 8.2, 8.4, 8.6, 8.8, 9.0, 9.2, 9.4, 9.6, 9.8, 9.9, 10.1, 10.3, 10.5, 10.7, 10.9];
export const WHO_WEIGHT_P85 = [3.7, 5.1, 6.3, 7.2, 7.8, 8.4, 8.8, 9.3, 9.6, 9.9, 10.2, 10.5, 10.8, 11.1, 11.3, 11.5, 11.8, 12.0, 12.2, 12.4, 12.7, 12.9, 13.2, 13.4, 13.7];

// ─── Vaccination Schedule ─────────────────────────────────────────────────────

export interface VaccineEntry {
  id: string;
  name: string;
  dueDate: string;
  status: 'done' | 'due_soon' | 'overdue' | 'upcoming';
  givenAt?: string;
}

export const MOCK_VACCINATION_SCHEDULE: VaccineEntry[] = [
  { id: 'v1', name: 'BCG', dueDate: 'At birth', status: 'done', givenAt: 'Sep 2022' },
  { id: 'v2', name: 'Hepatitis B (Dose 1)', dueDate: 'At birth', status: 'done', givenAt: 'Sep 2022' },
  { id: 'v3', name: 'OPV 0', dueDate: 'At birth', status: 'done', givenAt: 'Sep 2022' },
  { id: 'v4', name: 'DTP + IPV + Hib (Dose 1)', dueDate: '6 weeks', status: 'done', givenAt: 'Oct 2022' },
  { id: 'v5', name: 'Rotavirus (Dose 1)', dueDate: '6 weeks', status: 'done', givenAt: 'Oct 2022' },
  { id: 'v6', name: 'PCV (Dose 1)', dueDate: '6 weeks', status: 'done', givenAt: 'Oct 2022' },
  { id: 'v7', name: 'MMR (Dose 1)', dueDate: '9 months', status: 'done', givenAt: 'Jun 2023' },
  { id: 'v8', name: 'Varicella (Dose 1)', dueDate: '15 months', status: 'done', givenAt: 'Dec 2023' },
  { id: 'v9', name: 'MMR (Dose 2)', dueDate: '15 months', status: 'done', givenAt: 'Dec 2023' },
  { id: 'v10', name: 'Hepatitis A (Dose 2)', dueDate: 'Oct 2024', status: 'due_soon' },
  { id: 'v11', name: 'Typhoid Booster', dueDate: 'Nov 2024', status: 'upcoming' },
  { id: 'v12', name: 'Influenza (Annual)', dueDate: 'Dec 2024', status: 'upcoming' },
];

// ─── AI Conversation ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  delay?: number; // ms before this message appears
}

export const MOCK_AI_CONVERSATION: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'ai',
    content: "I can see Arav is 2 years old with a known Penicillin allergy. Let me ask a few quick questions so the doctor is fully prepared. Where exactly is the discomfort — tummy, chest, or somewhere else?",
    delay: 900,
  },
  {
    id: 'msg-2',
    role: 'user',
    content: "It's his stomach, he keeps holding it and crying",
  },
  {
    id: 'msg-3',
    role: 'ai',
    content: "Understood. Has he had a fever along with the stomach pain? Even a mild one?",
    delay: 1000,
  },
  {
    id: 'msg-4',
    role: 'user',
    content: "Yes, 100.2°F since this morning",
  },
  {
    id: 'msg-5',
    role: 'ai',
    content: "Got it. Has he vomited or had loose stools today?",
    delay: 800,
  },
  {
    id: 'msg-6',
    role: 'user',
    content: "He vomited once about 2 hours ago",
  },
  {
    id: 'msg-7',
    role: 'ai',
    content: "Thank you. Is he still drinking fluids — water, milk, or juice — even in small amounts?",
    delay: 1100,
  },
  {
    id: 'msg-8',
    role: 'user',
    content: "He had some water but refused to eat anything",
  },
];

export const MOCK_AI_SUMMARY_DETAILS = {
  chiefComplaint: 'Stomach pain with fever',
  details: [
    { label: 'Started', value: 'This morning' },
    { label: 'Fever', value: '100.2°F' },
    { label: 'Associated', value: 'Vomiting once, reduced appetite' },
    { label: 'Fluids', value: 'Drinking small amounts of water' },
    { label: 'Severity', value: 'Moderate — distressed but consolable' },
  ],
  relevantHistory: 'Arav had a similar episode in Jun 2024 — resolved with ORS and 48h rest.',
  allergyNote: 'Allergy on file: Penicillin — avoid amoxicillin and related antibiotics',
};

// ─── Time slots for booking ───────────────────────────────────────────────────

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { time: '9:00 AM', available: false },
  { time: '9:30 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '11:30 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '2:00 PM', available: true },
  { time: '2:30 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '3:30 PM', available: false },
  { time: '4:00 PM', available: true },
];
