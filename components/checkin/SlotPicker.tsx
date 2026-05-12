import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { TimeSlotRow } from '@/hooks/useDoctors';

export interface SlotPickerProps {
  slots: TimeSlotRow[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  emptyText?: string;
}

export function SlotPicker({ slots, selectedTime, onSelect, emptyText = 'No available slots for this date' }: SlotPickerProps) {
  if (slots.length === 0) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const active = selectedTime === slot.time;
        return (
          <Pressable
            key={slot.id}
            disabled={!slot.is_available}
            style={[
              styles.chip,
              !slot.is_available && styles.disabled,
              active && styles.selected,
            ]}
            onPress={() => onSelect(slot.time)}
          >
            <Text
              style={[
                styles.text,
                !slot.is_available && styles.textDisabled,
                active && styles.textSelected,
              ]}
            >
              {slot.time}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}20`,
  },
  disabled: { backgroundColor: AppColors.surfaceContainerHigh, borderColor: 'transparent' },
  selected: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  text: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  textDisabled: { color: `${AppColors.onSurfaceVariant}50` },
  textSelected: { color: AppColors.onPrimary },
});
