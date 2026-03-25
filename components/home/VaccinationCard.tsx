import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, PressableFeedback } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface VaccinationCardProps {
  nextVaccine: string;
  nextDate: string;
  onViewSchedule?: () => void;
}

export function VaccinationCard({ nextVaccine, nextDate, onViewSchedule }: VaccinationCardProps) {
  return (
    <PressableFeedback onPress={onViewSchedule}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[`${AppColors.primary}20`, `${AppColors.primaryContainer}40`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <View style={styles.iconInner}>
                <Ionicons name="calendar" size={18} color={AppColors.primary} />
              </View>
            </LinearGradient>
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>UPCOMING</Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{nextDate}</Text>
              </View>
            </View>
            <Text style={styles.vaccineName} numberOfLines={1}>{nextVaccine}</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={14} color={AppColors.primary} />
            </View>
          </View>
        </View>
      </Card>
    </PressableFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${AppColors.primaryContainer}30`,
  },
  content: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    flexShrink: 0,
  },
  iconGradient: {
    width: 46,
    height: 46,
    borderRadius: 14,
    padding: 3,
  },
  iconInner: {
    flex: 1,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 9,
    color: AppColors.primary,
    letterSpacing: 1,
  },
  dateBadge: {
    backgroundColor: `${AppColors.primary}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: AppColors.primary,
  },
  vaccineName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    letterSpacing: -0.2,
  },
  actionContainer: {
    flexShrink: 0,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${AppColors.primaryContainer}35`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
