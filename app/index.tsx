import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { AppLogo } from '@/components/app-logo';
import { AvatarStack } from '@/components/avatar-stack';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';

export default function SplashScreen() {
  const arrowBounce = useSharedValue(0);

  useEffect(() => {
    arrowBounce.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [arrowBounce]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowBounce.value }],
  }));

  return (
    <View style={layout.screenContainer}>
      <GradientBackground />

      <View style={layout.centeredContent}>
        <AppLogo />

        <Animated.Text
          entering={FadeInUp.delay(500).duration(600)}
          style={[typography.bodyLG, styles.tagline]}
        >
          Your Child's Health, Always{'\n'}Protected.
        </Animated.Text>

        {/* Tappable arrow CTA */}
        <Animated.View
          entering={FadeIn.delay(800).duration(600)}
          style={styles.arrowSection}
        >
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.arrowButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Animated.View style={arrowStyle}>
              <LinearGradient
                colors={[AppColors.primary, AppColors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.arrowCircle}
              >
                <Text style={styles.arrowIcon}>{'\u2193'}</Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
          <Animated.Text
            entering={FadeIn.delay(1000).duration(600)}
            style={[typography.labelSM, styles.entryText]}
          >
            GET STARTED
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Bottom trust card */}
      <Animated.View
        entering={FadeInDown.delay(1200).duration(700)}
        style={styles.bottomCard}
      >
        <GlassCard style={styles.cardRow}>
          <AvatarStack badgeLabel="500+" />
          <View style={styles.cardTextSection}>
            <Text style={[typography.labelXS, { color: AppColors.primary }]}>
              TRUSTED NETWORK
            </Text>
            <Text style={[typography.labelLG, styles.specialistsText]}>
              Top-tier Specialists
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tagline: {
    textAlign: 'center',
    marginTop: 48,
  },
  arrowSection: {
    alignItems: 'center',
    gap: 16,
    marginTop: 72,
  },
  arrowButton: {
    alignItems: 'center',
  },
  arrowCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  arrowIcon: {
    fontSize: 24,
    color: AppColors.onPrimary,
  },
  entryText: {
    color: `${AppColors.primary}99`,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextSection: {
    alignItems: 'flex-end',
  },
  specialistsText: {
    marginTop: 2,
  },
});
