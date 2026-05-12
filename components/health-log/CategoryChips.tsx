import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { HealthNoteRow } from '@/hooks/useHealthNotes';

import { HEALTH_CATEGORIES } from './categories';

export interface CategoryChipsProps {
  value: HealthNoteRow['category'];
  onChange: (id: HealthNoteRow['category']) => void;
}

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <View style={styles.grid}>
      {HEALTH_CATEGORIES.map((cat) => {
        const active = value === cat.id;
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={active ? AppColors.primary : AppColors.onSurfaceVariant}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}35`,
  },
  chipActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}08` },
  label: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurface },
  labelActive: { color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' },
});
