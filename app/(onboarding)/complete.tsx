import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';
import { useOnboarding } from '@/context/onboarding';

export default function CompleteScreen() {
  const { childName } = useOnboarding();
  const displayName = childName || 'your child';

  return (
    <View style={layout.screenContainer}>
      <GradientBackground />

      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.iconSection}>
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkCircle}
          >
            <Text style={styles.checkMark}>{'\u2713'}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.textSection}>
          <Text style={typography.headingXL}>You&apos;re All Set!</Text>
          <Text style={[typography.bodyLG, styles.subtitle]}>
            {displayName}&apos;s health profile is ready. Doctors will now have instant access to this information during consultations.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.footer}>
          <GradientButton
            label="Go to Home"
            onPress={() => router.replace('/(tabs)')}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    marginBottom: 32,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  checkMark: {
    fontSize: 44,
    color: AppColors.onPrimary,
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
  },
  footer: {
    width: '100%',
    marginTop: 48,
  },
});
