import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';

import { AppColors } from '@/constants/theme';

interface TextInputFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
}

/**
 * Styled text input following DESIGN.md input field spec.
 * surfaceContainerLow bg, transitions to surfaceContainerLowest on focus
 * with a ghost border in primary at 30% opacity.
 */
export function TextInputField({ label, hint, style, ...props }: TextInputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {(label || hint) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
      )}
      <TextInput
        placeholderTextColor={AppColors.outlineVariant}
        style={[
          styles.input,
          focused && styles.inputFocused,
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginLeft: 4,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  hint: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
  },
  input: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderColor: `${AppColors.primary}4D`,
  },
});
