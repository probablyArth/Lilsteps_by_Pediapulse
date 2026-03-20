import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { AppColors } from '@/constants/theme';

const VAX_STATUS = ['Given', 'Missed', 'Not sure'];

const VACCINES = [
  { name: 'BCG', note: 'Given at birth' },
  { name: 'Hepatitis B', note: 'Birth + 6 & 14 weeks' },
  { name: 'OPV', note: 'Oral Polio — 6, 10, 14 weeks' },
  { name: 'IPV', note: 'Injectable Polio — 6 & 14 weeks' },
  { name: 'Pentavalent', note: 'DPT + Hib + HepB — 6, 10, 14 weeks' },
  { name: 'Rotavirus', note: '6, 10, 14 weeks' },
  { name: 'Measles / MR', note: '9 months' },
];

export default function VaccinationInfantScreen() {
  const [vaccineStatus, setVaccineStatus] = useState<Record<string, string>>({});

  const updateStatus = (vaccine: string, val: string[]) => {
    setVaccineStatus((prev) => ({ ...prev, [vaccine]: val[0] ?? '' }));
  };

  const givenCount = Object.values(vaccineStatus).filter((s) => s === 'Given').length;

  return (
    <OnboardingShell
      progress={0.88}
      title="Vaccination Status"
      subtitle="Select the status for each vaccine — you can update records anytime in the Vaccination Tracker"
      ctaLabel="Continue"
      onCta={() => router.push('/(onboarding)/a-sleep')}
    >
      <View style={styles.vaccineList}>
        {VACCINES.map((vaccine) => (
          <View key={vaccine.name} style={styles.vaccineRow}>
            <View style={styles.vaccineInfo}>
              <Text style={styles.vaccineName}>{vaccine.name}</Text>
              <Text style={styles.vaccineNote}>{vaccine.note}</Text>
            </View>
            <ChipGroup
              options={VAX_STATUS}
              selected={vaccineStatus[vaccine.name] ? [vaccineStatus[vaccine.name]] : []}
              onChange={(val) => updateStatus(vaccine.name, val)}
            />
          </View>
        ))}
      </View>

      {givenCount > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {givenCount} of {VACCINES.length} vaccines marked as given
          </Text>
        </View>
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  vaccineList: {
    gap: 16,
  },
  vaccineRow: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  vaccineInfo: {
    gap: 2,
  },
  vaccineName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  vaccineNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
  },
  summary: {
    backgroundColor: AppColors.primaryContainer,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onPrimaryContainer,
    textAlign: 'center',
  },
});
