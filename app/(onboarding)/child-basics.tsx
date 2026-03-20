import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';
import { useOnboarding } from '@/context/onboarding';

const SEX_OPTIONS = ['Male', 'Female'];
const RELATIONSHIP = ['Mother', 'Father', 'Grandparent', 'Guardian'];

function calculateBracket(dob: Date): 'A' | 'B' | 'C' {
  const ageMs = Date.now() - dob.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 3) return 'A';
  if (ageYears < 9) return 'B';
  return 'C';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChildBasicsScreen() {
  const { setChildName, setBracket, setChildSex, setDob: saveDob } = useOnboarding();
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [sex, setSex] = useState<string[]>([]);
  const [relationship, setRelationship] = useState<string[]>([]);

  const handleContinue = () => {
    setChildName(firstName);
    if (sex[0]) setChildSex(sex[0].toLowerCase() as 'male' | 'female');
    if (dob) { setBracket(calculateBracket(dob)); saveDob(dob); }
    router.push('/(onboarding)/physical');
  };

  return (
    <OnboardingShell
      progress={0.18}
      title="Child's Details"
      subtitle="Basic information about your child"
      ctaLabel="Continue"
      onCta={handleContinue}
    >
      <TextInputField
        label="First Name"
        placeholder="Child's first name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      {/* Date of Birth */}
      <View>
        <Text style={styles.fieldLabel}>Date of Birth</Text>
        {Platform.OS === 'android' && (
          <Pressable onPress={() => setShowPicker(true)} style={styles.dateTrigger}>
            <Text style={dob ? styles.dateText : styles.datePlaceholder}>
              {dob ? formatDate(dob) : 'Select date of birth'}
            </Text>
          </Pressable>
        )}
        {showPicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            maximumDate={new Date()}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (date) setDob(date);
            }}
          />
        )}
        {dob && (
          <Text style={styles.bracketHint}>
            Age bracket: {calculateBracket(dob) === 'A' ? '0–2 years' : calculateBracket(dob) === 'B' ? '3–8 years' : '9–15 years'}
          </Text>
        )}
      </View>

      <View>
        <Text style={styles.fieldLabel}>Biological Sex</Text>
        <ChipGroup options={SEX_OPTIONS} selected={sex} onChange={setSex} />
      </View>

      <View>
        <Text style={styles.fieldLabel}>Your Relationship to Child</Text>
        <ChipGroup options={RELATIONSHIP} selected={relationship} onChange={setRelationship} />
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
  dateTrigger: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurface,
  },
  datePlaceholder: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.outlineVariant,
  },
  bracketHint: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: AppColors.primary,
    marginTop: 6,
    marginLeft: 4,
  },
});
