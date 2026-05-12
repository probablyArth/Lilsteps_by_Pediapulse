import type { HealthNoteRow } from '@/hooks/useHealthNotes';

export interface HealthCategory {
  id: HealthNoteRow['category'];
  label: string;
  icon: string;
  placeholder: string;
}

export const HEALTH_CATEGORIES: HealthCategory[] = [
  { id: 'symptom',    label: 'Symptom',    icon: 'thermometer-outline', placeholder: 'e.g. Mild fever since this morning, temp 99.4°F' },
  { id: 'behaviour',  label: 'Behaviour',  icon: 'happy-outline',        placeholder: 'e.g. Less playful today, not finishing meals' },
  { id: 'sleep',      label: 'Sleep',      icon: 'moon-outline',         placeholder: 'e.g. Woke up 3 times, total ~7 hrs' },
  { id: 'feeding',    label: 'Feeding',    icon: 'nutrition-outline',    placeholder: 'e.g. Refused solids, only took 200ml milk' },
  { id: 'medication', label: 'Medication', icon: 'medkit-outline',       placeholder: 'e.g. Calpol 250mg at 8 AM for fever' },
  { id: 'other',      label: 'Other',      icon: 'create-outline',       placeholder: 'Add any note about today…' },
];

export const SEVERITY_AWARE_CATEGORIES: HealthNoteRow['category'][] = ['symptom', 'behaviour', 'other'];
