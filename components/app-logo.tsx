import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';

/**
 * The LittleSteps brand logo — gradient icon with dot pattern + brand name.
 * Reusable on splash, onboarding, auth, and about screens.
 */
export function AppLogo() {
  return (
    <Animated.View entering={FadeIn.duration(800)} style={styles.container}>
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.icon}
      >
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotLarge]} />
          <View style={styles.dotRow}>
            <View style={[styles.dot, styles.dotSmall]} />
            <View style={[styles.dot, styles.dotSmall]} />
          </View>
        </View>
      </LinearGradient>

      <Animated.Text
        entering={FadeInUp.delay(300).duration(600)}
        style={typography.headingXL}
      >
        LittleSteps
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  dotsContainer: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 999,
  },
  dotLarge: {
    width: 14,
    height: 14,
  },
  dotSmall: {
    width: 10,
    height: 10,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
