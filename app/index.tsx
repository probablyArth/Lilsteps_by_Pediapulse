import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/avatar-stack';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { dbg } from '@/lib/debug';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { session, loading, hasChildren } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    dbg.nav('Splash effect', { loading, hasSession: !!session, hasChildren, hasNavigated: hasNavigated.current });
    if (loading || hasNavigated.current) return;
    if (session && hasChildren !== null) {
      hasNavigated.current = true;
      const target = hasChildren ? '/(tabs)' : '/(onboarding)/parent-details';
      dbg.nav(`Splash → ${target}`);
      router.replace(target as '/(tabs)');
    }
  }, [session, loading, hasChildren]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[AppColors.surface, AppColors.surfaceContainerLow, AppColors.surfaceContainer]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.topRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusLabel}>PEDIATRIC HEALTH SUITE</Text>
        </Animated.View>

        <View style={styles.heroSection}>
          <Animated.View entering={FadeIn.delay(150).duration(700)} style={styles.logoWrap}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <View style={styles.logoDots}>
                <View style={[styles.logoDot, styles.logoDotLarge]} />
                <View style={styles.logoDotRow}>
                  <View style={[styles.logoDot, styles.logoDotSmall]} />
                  <View style={[styles.logoDot, styles.logoDotSmall]} />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.brandWrap}>
            <Text style={styles.wordmark}>
              <Text style={styles.wordmarkLight}>Lil</Text>
              <Text style={styles.wordmarkBold}>Steps</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(450).duration(700)} style={styles.headlineWrap}>
            <Text style={styles.headline}>
              Every little step,{'\n'}
              <Text style={styles.headlineAccent}>gently guided.</Text>
            </Text>
            <Text style={styles.subhead}>
              A calm, doctor-built sanctuary for your child&apos;s health journey.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(700)} style={styles.bottomSection}>
          <View style={styles.trustCard}>
            <AvatarStack badgeLabel="500+" />
            <View style={styles.trustTextWrap}>
              <Text style={styles.trustEyebrow}>TRUSTED NETWORK</Text>
              <Text style={styles.trustTitle}>Top-tier Specialists</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonLabel}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.secondaryButtonLabel}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  blobTopLeft: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${AppColors.primaryContainer}33`,
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -140,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: `${AppColors.secondaryContainer}33`,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primary,
  },
  statusLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 2.4,
    color: AppColors.onSurfaceVariant,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 28,
  },
  logoWrap: {
    alignSelf: 'flex-start',
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  logoDots: {
    alignItems: 'center',
    gap: 4,
  },
  logoDot: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 999,
  },
  logoDotLarge: {
    width: 9,
    height: 9,
  },
  logoDotSmall: {
    width: 7,
    height: 7,
  },
  logoDotRow: {
    flexDirection: 'row',
    gap: 5,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 22,
    color: AppColors.onSurfaceVariant,
    letterSpacing: -0.4,
  },
  wordmarkLight: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: AppColors.onSurfaceVariant,
  },
  wordmarkBold: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: AppColors.onSurface,
  },
  headlineWrap: {
    gap: 14,
  },
  headline: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.2,
    color: AppColors.onSurface,
  },
  headlineAccent: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: AppColors.primary,
    fontStyle: 'italic',
  },
  subhead: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    color: AppColors.onSurfaceVariant,
    maxWidth: 320,
  },
  bottomSection: {
    gap: 16,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${AppColors.surfaceContainerLowest}CC`,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  trustTextWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  trustEyebrow: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: AppColors.primary,
  },
  trustTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
    color: AppColors.onPrimary,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  secondaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurface,
  },
});
