import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface ChipGroupProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  /** When this value is selected, all others deselect; when others selected, this deselects */
  noneValue?: string;
}

export function ChipGroup({
  options,
  selected,
  onChange,
  multiSelect = false,
  noneValue,
}: ChipGroupProps) {
  const handlePress = (option: string) => {
    if (!multiSelect) {
      onChange([option]);
      return;
    }

    // Multi-select logic
    if (noneValue && option === noneValue) {
      // Selecting "None" clears everything else
      onChange(selected.includes(noneValue) ? [] : [noneValue]);
      return;
    }

    // Selecting a non-None option
    const withoutNone = selected.filter((s) => s !== noneValue);
    if (withoutNone.includes(option)) {
      onChange(withoutNone.filter((s) => s !== option));
    } else {
      onChange([...withoutNone, option]);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => handlePress(option)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: AppColors.surfaceContainerLow,
  },
  chipSelected: {
    backgroundColor: AppColors.primary,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: AppColors.onPrimary,
  },
});
