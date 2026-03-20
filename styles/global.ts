import { StyleSheet } from 'react-native';

import { AppColors } from '@/constants/theme';

/**
 * Shared typography styles using Plus Jakarta Sans.
 * Use these instead of defining font families inline.
 */
export const typography = StyleSheet.create({
  headingXL: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 36,
    color: AppColors.onSurface,
    letterSpacing: -0.5,
  },
  headingLG: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    color: AppColors.onSurface,
    letterSpacing: -0.3,
  },
  headingMD: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    color: AppColors.onSurface,
  },
  bodyLG: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 18,
    color: AppColors.onSurfaceVariant,
    lineHeight: 28,
  },
  bodyMD: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurfaceVariant,
    lineHeight: 24,
  },
  bodySM: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    lineHeight: 20,
  },
  labelLG: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  labelSM: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 3.5,
  },
  labelXS: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
});

/**
 * Common layout patterns reused across screens.
 */
export const layout = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
