import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Other'];
const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'];

export default function ParentDetailsScreen() {
  const {
    parentName, parentCity, parentLanguage,
    setParentName, setParentCity, setParentLanguage,
  } = useOnboarding();
  // Seed from any restored draft so a killed app doesn't lose typed data
  const [name, setName] = useState(parentName);
  const [city, setCity] = useState<string[]>(parentCity ? [parentCity] : []);
  const [language, setLanguage] = useState<string[]>(parentLanguage ? [parentLanguage] : []);

  const handleContinue = () => {
    setParentName(name.trim());
    setParentCity(city[0] ?? '');
    setParentLanguage(language[0] ?? '');
    router.push('/(onboarding)/add-child');
  };

  return (
    <OnboardingShell
      progress={0.05}
      title="About You"
      subtitle="Tell us a bit about yourself so we can personalise your experience"
      ctaLabel="Continue"
      onCta={handleContinue}
    >
      <TextInputField
        label="Full Name"
        hint="(Parent or Guardian)"
        placeholder="e.g. Sarah Johnson"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
      />

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>City</Text>
        <ChipGroup options={CITIES} selected={city} onChange={setCity} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Preferred Language</Text>
        <ChipGroup options={LANGUAGES} selected={language} onChange={setLanguage} />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
});
