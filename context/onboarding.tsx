import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

import { dbg } from '@/lib/debug';
import { appStorage, StorageKeys } from '@/lib/storage';

type AgeBracket = 'A' | 'B' | 'C' | null;
type ChildSex = 'male' | 'female' | null;

interface OnboardingState {
  /** Parent/guardian details from the parent-details screen. */
  parentName: string;
  parentCity: string;
  parentLanguage: string;
  childName: string;
  bracket: AgeBracket;
  childSex: ChildSex;
  dob: Date | null;
  weight: string;
  height: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  /** Canonical IAP vaccine names the parent marked as "Given" in onboarding.
   *  Used by confirm.tsx to mark the trigger-generated vaccination rows as
   *  status='done' (only the doses whose scheduled_date is on/before today). */
  vaccinationsGiven: string[];
  /** Per-row display-name → 'Given' | 'Missed' | 'Not sure' map, so the
   *  vaccination screens restore every mark (not just Given) from a draft. */
  vaccineStatus: Record<string, string>;
  setParentName: (name: string) => void;
  setParentCity: (city: string) => void;
  setParentLanguage: (language: string) => void;
  setChildName: (name: string) => void;
  setBracket: (bracket: AgeBracket) => void;
  setChildSex: (sex: ChildSex) => void;
  setDob: (dob: Date) => void;
  setWeight: (weight: string) => void;
  setHeight: (height: string) => void;
  setBloodGroup: (bg: string) => void;
  setAllergies: (allergies: string[]) => void;
  setConditions: (conditions: string[]) => void;
  setVaccinationsGiven: (names: string[]) => void;
  setVaccineStatus: (status: Record<string, string>) => void;
  /** Clear the in-flight draft (state + storage). Call after the child is saved. */
  resetOnboarding: () => void;
}

/** Serializable snapshot persisted so an app kill mid-onboarding doesn't lose progress. */
interface DraftSnapshot {
  parentName: string;
  parentCity: string;
  parentLanguage: string;
  childName: string;
  bracket: AgeBracket;
  childSex: ChildSex;
  dob: string | null; // ISO
  weight: string;
  height: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  vaccinationsGiven: string[];
  vaccineStatus: Record<string, string>;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [parentName, setParentName] = useState('');
  const [parentCity, setParentCity] = useState('');
  const [parentLanguage, setParentLanguage] = useState('');
  const [childName, setChildName] = useState('');
  const [bracket, setBracket] = useState<AgeBracket>(null);
  const [childSex, setChildSex] = useState<ChildSex>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [vaccinationsGiven, setVaccinationsGiven] = useState<string[]>([]);
  const [vaccineStatus, setVaccineStatus] = useState<Record<string, string>>({});

  // Hydrate a persisted draft once on mount, then mirror every change back to
  // storage. The guard stops the save effect from clobbering a stored draft
  // with the initial empty state before hydration finishes.
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await appStorage.getItem(StorageKeys.onboardingDraft);
        if (raw) {
          const d: DraftSnapshot = JSON.parse(raw);
          dbg.hook('Onboarding: restoring draft', { childName: d.childName });
          if (d.parentName) setParentName(d.parentName);
          if (d.parentCity) setParentCity(d.parentCity);
          if (d.parentLanguage) setParentLanguage(d.parentLanguage);
          if (d.childName) setChildName(d.childName);
          if (d.bracket) setBracket(d.bracket);
          if (d.childSex) setChildSex(d.childSex);
          if (d.dob) setDob(new Date(d.dob));
          if (d.weight) setWeight(d.weight);
          if (d.height) setHeight(d.height);
          if (d.bloodGroup) setBloodGroup(d.bloodGroup);
          if (d.allergies?.length) setAllergies(d.allergies);
          if (d.conditions?.length) setConditions(d.conditions);
          if (d.vaccinationsGiven?.length) setVaccinationsGiven(d.vaccinationsGiven);
          if (d.vaccineStatus && Object.keys(d.vaccineStatus).length) setVaccineStatus(d.vaccineStatus);
        }
      } catch {
        // Corrupt draft — start fresh
        appStorage.removeItem(StorageKeys.onboardingDraft);
      }
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const snapshot: DraftSnapshot = {
      parentName, parentCity, parentLanguage,
      childName, bracket, childSex,
      dob: dob ? dob.toISOString() : null,
      weight, height, bloodGroup, allergies, conditions, vaccinationsGiven, vaccineStatus,
    };
    appStorage.setItem(StorageKeys.onboardingDraft, JSON.stringify(snapshot));
  }, [parentName, parentCity, parentLanguage, childName, bracket, childSex, dob, weight, height, bloodGroup, allergies, conditions, vaccinationsGiven, vaccineStatus]);

  function resetOnboarding() {
    dbg.hook('Onboarding: resetting draft');
    setParentName('');
    setParentCity('');
    setParentLanguage('');
    setChildName('');
    setBracket(null);
    setChildSex(null);
    setDob(null);
    setWeight('');
    setHeight('');
    setBloodGroup('');
    setAllergies([]);
    setConditions([]);
    setVaccinationsGiven([]);
    setVaccineStatus({});
    appStorage.removeItem(StorageKeys.onboardingDraft);
  }

  return (
    <OnboardingContext.Provider
      value={{
        parentName, parentCity, parentLanguage,
        childName, bracket, childSex, dob, weight, height, bloodGroup, allergies, conditions,
        vaccinationsGiven, vaccineStatus,
        setParentName, setParentCity, setParentLanguage,
        setChildName, setBracket, setChildSex, setDob, setWeight, setHeight, setBloodGroup,
        setAllergies, setConditions, setVaccinationsGiven, setVaccineStatus,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
