import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface AllergyBannerProps {
  allergies: string[];
}

export function AllergyBanner({ allergies }: AllergyBannerProps) {
  if (allergies.length === 0) return null;
  return (
    <View style={styles.banner}>
      <Ionicons name="warning" size={18} color={AppColors.tertiary} />
      <View style={styles.text}>
        <Text style={styles.label}>Allergy on file: </Text>
        <Text style={styles.names}>{allergies.join(', ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${AppColors.tertiaryContainer}30`,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.tertiary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.tertiary,
  },
  names: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.tertiary,
  },
});
