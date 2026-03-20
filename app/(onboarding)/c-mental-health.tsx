import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';

const YES_NO = ['Yes', 'No'];

export default function MentalHealthScreen() {
  const [moodChanges, setMoodChanges] = useState<string[]>([]);
  const [moodDetails, setMoodDetails] = useState('');
  const [anxietyHistory, setAnxietyHistory] = useState<string[]>([]);

  return (
    <OnboardingShell
      progress={0.83}
      title="Mental Wellbeing"
      subtitle="This section is optional but helps the doctor give better care"
      ctaLabel="Continue"
      onCta={() => router.push('/(onboarding)/c-vaccination')}
    >
      <View style={styles.notice}>
        <Text style={[typography.bodySM, { color: AppColors.onSurfaceVariant }]}>
          You can skip any question here. Everything shared is confidential and only visible to the consulting doctor.
        </Text>
      </View>

      <View>
        <Text style={styles.fieldLabel}>
          Any recent changes in mood, social withdrawal, or behaviour?
        </Text>
        <ChipGroup options={YES_NO} selected={moodChanges} onChange={setMoodChanges} />
      </View>

      {moodChanges.includes('Yes') && (
        <TextInputField
          placeholder="Briefly describe what you've noticed"
          value={moodDetails}
          onChangeText={setMoodDetails}
          multiline
        />
      )}

      <View>
        <Text style={styles.fieldLabel}>Any history of anxiety or depression?</Text>
        <ChipGroup options={YES_NO} selected={anxietyHistory} onChange={setAnxietyHistory} />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: `${AppColors.surfaceContainerLow}`,
    borderRadius: 12,
    padding: 14,
  },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    marginLeft: 4,
    marginBottom: 8,
  },
});
