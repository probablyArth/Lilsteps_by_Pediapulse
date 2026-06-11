import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';

const MED_ALLERGIES = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Codeine', 'Not known', 'Other'];
const FOOD_ALLERGIES = ['Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Gluten', 'Soy', 'Not known', 'Other'];
const OTHER_ALLERGIES = ['Latex', 'Dust', 'Pollen', 'Animal dander', 'Insect stings', 'Not known', 'Other'];

export default function AllergiesScreen() {
  const { childName, allergies: savedAllergies, setAllergies: saveAllergies } = useOnboarding();
  const displayName = childName || 'your child';

  // Seed from any restored draft: known chips back into their category,
  // custom entries (typed via "Other") collected into the Other free-text.
  const seed = (options: string[]) =>
    options.filter((o) => o !== 'Not known' && o !== 'Other' && savedAllergies.includes(o));
  const knownOptions = [...MED_ALLERGIES, ...FOOD_ALLERGIES, ...OTHER_ALLERGIES];
  const savedCustom = savedAllergies.filter((a) => !knownOptions.includes(a));

  const [medAllergies, setMedAllergies] = useState<string[]>(() => seed(MED_ALLERGIES));
  const [foodAllergies, setFoodAllergies] = useState<string[]>(() => seed(FOOD_ALLERGIES));
  const [otherAllergies, setOtherAllergies] = useState<string[]>(() => [
    ...seed(OTHER_ALLERGIES),
    ...(savedCustom.length > 0 ? ['Other'] : []),
  ]);
  const [medOther, setMedOther] = useState('');
  const [foodOther, setFoodOther] = useState('');
  const [otherOther, setOtherOther] = useState(savedCustom.join(', '));

  // Collect all selected allergies (excluding "None" and "Other") for preview
  const allSelected = [
    ...medAllergies.filter((a) => a !== 'Not known' && a !== 'Other'),
    ...(medAllergies.includes('Other') && medOther ? [medOther] : []),
    ...foodAllergies.filter((a) => a !== 'Not known' && a !== 'Other'),
    ...(foodAllergies.includes('Other') && foodOther ? [foodOther] : []),
    ...otherAllergies.filter((a) => a !== 'Not known' && a !== 'Other'),
    ...(otherAllergies.includes('Other') && otherOther ? [otherOther] : []),
  ];

  return (
    <OnboardingShell
      progress={0.38}
      title={`Does ${displayName} have any known allergies?`}
      subtitle="This will be flagged to every doctor, every time."
      ctaLabel="Continue"
      onCta={() => { saveAllergies(allSelected); router.push('/(onboarding)/conditions'); }}
    >
      {/* Medication allergies */}
      <View>
        <Text style={styles.sectionTitle}>Medication Allergies</Text>
        <ChipGroup
          options={MED_ALLERGIES}
          selected={medAllergies}
          onChange={setMedAllergies}
          multiSelect
          noneValue="Not known"
        />
        {medAllergies.includes('Other') && (
          <TextInputField
            placeholder="Specify medication allergy"
            value={medOther}
            onChangeText={setMedOther}
          />
        )}
      </View>

      {/* Food allergies */}
      <View>
        <Text style={styles.sectionTitle}>Food Allergies</Text>
        <ChipGroup
          options={FOOD_ALLERGIES}
          selected={foodAllergies}
          onChange={setFoodAllergies}
          multiSelect
          noneValue="Not known"
        />
        {foodAllergies.includes('Other') && (
          <TextInputField
            placeholder="Specify food allergy"
            value={foodOther}
            onChangeText={setFoodOther}
          />
        )}
      </View>

      {/* Other allergies */}
      <View>
        <Text style={styles.sectionTitle}>Other Allergies</Text>
        <ChipGroup
          options={OTHER_ALLERGIES}
          selected={otherAllergies}
          onChange={setOtherAllergies}
          multiSelect
          noneValue="Not known"
        />
        {otherAllergies.includes('Other') && (
          <TextInputField
            placeholder="Specify other allergy"
            value={otherOther}
            onChangeText={setOtherOther}
          />
        )}
      </View>

      {/* Allergy preview badge */}
      {allSelected.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {displayName}&apos;s allergy alert: {allSelected.join(', ')}
          </Text>
        </View>
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    marginLeft: 4,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: AppColors.tertiaryContainer,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.tertiary,
  },
});
