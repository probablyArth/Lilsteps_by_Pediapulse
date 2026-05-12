import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface DayOption {
  label: string;
  sub: string;
  isoDate: string;
}

export function getNextDays(n: number): DayOption[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : labels[d.getDay()],
      sub: `${d.getDate()} ${months[d.getMonth()]}`,
      isoDate: d.toISOString().split('T')[0],
    };
  });
}

export interface DateStripProps {
  days: DayOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DateStrip({ days, selectedIndex, onSelect }: DateStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((d, i) => {
        const active = selectedIndex === i;
        return (
          <Pressable
            key={i}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(i)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{d.label}</Text>
            <Text style={[styles.date, active && styles.dateActive]}>{d.sub}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10 },
  chip: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
    minWidth: 78,
  },
  chipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  label: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  labelActive: { color: AppColors.onPrimary },
  date: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
  dateActive: { color: `${AppColors.onPrimary}B0` },
});
