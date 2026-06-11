import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-', "Don't know"];

export default function PhysicalScreen() {
  const {
    weight: savedWeight,
    height: savedHeight,
    bloodGroup: savedBloodGroup,
    setWeight: saveWeight,
    setHeight: saveHeight,
    setBloodGroup: saveBloodGroup,
  } = useOnboarding();
  // Seed from any restored draft so a killed app doesn't lose typed data
  const [weight, setWeight] = useState(savedWeight);
  const [height, setHeight] = useState(savedHeight);
  const [bloodGroup, setBloodGroup] = useState<string[]>(savedBloodGroup ? [savedBloodGroup] : []);

  const handleContinue = () => {
    saveWeight(weight);
    saveHeight(height);
    saveBloodGroup(bloodGroup[0] ?? '');
    router.push('/(onboarding)/allergies');
  };

  return (
    <OnboardingShell
      progress={0.28}
      title="Physical Measurements"
      subtitle="Helps ensure medication dosing is always accurate"
      ctaLabel="Continue"
      onCta={handleContinue}
    >
      <TextInputField
        label="Weight"
        hint="(kg)"
        placeholder="e.g. 12.5"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      <TextInputField
        label="Height"
        hint="(cm)"
        placeholder="e.g. 85"
        value={height}
        onChangeText={setHeight}
        keyboardType="number-pad"
      />

      <View>
        <Text style={styles.fieldLabel}>Blood Group</Text>
        <ChipGroup options={BLOOD_GROUPS} selected={bloodGroup} onChange={setBloodGroup} />
      </View>
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
});
