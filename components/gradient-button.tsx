import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { AppColors } from '@/constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Primary action button with the signature gradient.
 * High-pill shape per DESIGN.md button spec.
 */
export function GradientButton({ label, onPress, style }: GradientButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },
});
