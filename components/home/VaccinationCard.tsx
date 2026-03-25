import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface VaccinationCardProps {
  nextVaccine: string;
  nextDate: string;
  onViewSchedule?: () => void;
}

export function VaccinationCard({ nextVaccine, nextDate, onViewSchedule }: VaccinationCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
      onPress={onViewSchedule}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={22} color={AppColors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>
            Next: {nextVaccine} ({nextDate})
          </Text>
          <Text style={styles.link}>View Schedule</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={`${AppColors.onSurfaceVariant}55`} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${AppColors.primary}0d`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  link: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.primary,
    textDecorationLine: 'underline',
  },
});
