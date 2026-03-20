import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';

const CONDITIONS = [
  'Asthma', 'Type 1 Diabetes', 'Epilepsy',
  'Congenital heart condition', 'Thalassemia', 'None', 'Other',
];
const MED_OPTIONS = ['Yes', 'No'];
const FREQUENCY_OPTIONS = ['Once daily', 'Twice daily', '3× daily', '4× daily', 'As needed'];

interface MedEntry {
  name: string;
  dose: string;
  frequency: string;
}

export default function ConditionsScreen() {
  const { bracket, setConditions: saveConditions } = useOnboarding();
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionOther, setConditionOther] = useState('');
  const [takingMeds, setTakingMeds] = useState<string[]>([]);
  const [meds, setMeds] = useState<MedEntry[]>([{ name: '', dose: '', frequency: '' }]);

  const updateMed = (index: number, field: keyof MedEntry, value: string) => {
    setMeds((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMed = () => setMeds((prev) => [...prev, { name: '', dose: '', frequency: '' }]);

  const removeMed = (index: number) => setMeds((prev) => prev.filter((_, i) => i !== index));

  const handleContinue = () => {
    saveConditions(conditions.filter((c) => c !== 'None' && c !== 'Other').concat(
      conditions.includes('Other') && conditionOther ? [conditionOther] : []
    ));
    if (bracket === 'A') router.push('/(onboarding)/a-birth-history');
    else if (bracket === 'B') router.push('/(onboarding)/b-development');
    else router.push('/(onboarding)/c-academic');
  };

  return (
    <OnboardingShell
      progress={0.48}
      title="Conditions & Medications"
      subtitle="Helps doctors prepare before a consultation"
      ctaLabel="Continue"
      onCta={handleContinue}
    >
      <View>
        <Text style={styles.fieldLabel}>Any diagnosed chronic conditions?</Text>
        <ChipGroup
          options={CONDITIONS}
          selected={conditions}
          onChange={setConditions}
          multiSelect
          noneValue="None"
        />
        {conditions.includes('Other') && (
          <View style={{ marginTop: 10 }}>
            <TextInputField
              placeholder="Specify condition"
              value={conditionOther}
              onChangeText={setConditionOther}
            />
          </View>
        )}
      </View>

      <View>
        <Text style={styles.fieldLabel}>Currently taking any regular medications?</Text>
        <ChipGroup options={MED_OPTIONS} selected={takingMeds} onChange={setTakingMeds} />
      </View>

      {takingMeds.includes('Yes') && (
        <View style={styles.medsSection}>
          {meds.map((med, index) => (
            <View key={index} style={styles.medCard}>
              <View style={styles.medCardHeader}>
                <Text style={styles.medCardTitle}>Medicine {index + 1}</Text>
                {meds.length > 1 && (
                  <Pressable onPress={() => removeMed(index)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                )}
              </View>

              <TextInputField
                label="Medicine name"
                placeholder="e.g. Paracetamol"
                value={med.name}
                onChangeText={(v) => updateMed(index, 'name', v)}
                autoCapitalize="words"
              />

              <TextInputField
                label="Dose"
                placeholder="e.g. 100mg, 5ml"
                value={med.dose}
                onChangeText={(v) => updateMed(index, 'dose', v)}
                autoCapitalize="none"
              />

              <View>
                <Text style={styles.freqLabel}>How often?</Text>
                <ChipGroup
                  options={FREQUENCY_OPTIONS}
                  selected={med.frequency ? [med.frequency] : []}
                  onChange={(val) => updateMed(index, 'frequency', val[0] ?? '')}
                />
              </View>

              {med.name && med.dose && med.frequency && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewText}>
                    {med.name} {med.dose} · {med.frequency}
                  </Text>
                </View>
              )}
            </View>
          ))}

          <Pressable onPress={addMed} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add another medication</Text>
          </Pressable>
        </View>
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    marginLeft: 4,
    marginBottom: 8,
  },
  medsSection: {
    gap: 12,
  },
  medCard: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medCardTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  removeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.tertiary,
  },
  freqLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurface,
    marginBottom: 8,
  },
  previewBadge: {
    backgroundColor: AppColors.primaryContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.primary,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.primary,
  },
});
