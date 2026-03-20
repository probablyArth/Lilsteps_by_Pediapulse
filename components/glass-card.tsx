import { StyleSheet, View, ViewProps } from 'react-native';

import { AppColors } from '@/constants/theme';

/**
 * A frosted-glass style card with translucent background and subtle border.
 * Reusable for info cards, CTAs, or floating panels.
 */
export function GlassCard({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: `${AppColors.surfaceContainerLowest}B3`,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}26`,
  },
});
