import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { dbg } from '@/lib/debug';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { session, loading, hasChildren } = useAuth();
  const hasNavigated = useRef(false);
  
  const breatheScale = useSharedValue(1);
  const breatheOpacity = useSharedValue(0.35);

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

  useEffect(() => {
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    breatheOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [breatheScale, breatheOpacity]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
    opacity: breatheOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[AppColors.surface, AppColors.surfaceContainer, AppColors.surfaceDim]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.breatheOrb, breatheStyle]} />
      <View style={styles.orbAccentSmall} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.heroSection}>
          <Animated.View entering={FadeIn.duration(800)} style={styles.logoContainer}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <View style={styles.logoDotsContainer}>
                <View style={[styles.logoDot, styles.logoDotLarge]} />
                <View style={styles.logoDotRow}>
                  <View style={[styles.logoDot, styles.logoDotSmall]} />
                  <View style={[styles.logoDot, styles.logoDotSmall]} />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(700)} style={styles.brandSection}>
            <View style={styles.brandRow}>
              <Text style={styles.brandLight}>Lil</Text>
              <Text style={styles.brandBold}>Steps</Text>
            </View>
            <Text style={styles.tagline}>
              Your child's health journey,{'\n'}simplified.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(600).duration(700)} style={styles.ctaSection}>
          <Pressable 
            onPress={() => router.push('/(auth)/signup')} 
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
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
            style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.secondaryButtonLabel}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(900).duration(600)}
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={14} color={AppColors.primary} />
            <Text style={styles.trustText}>HIPAA Compliant</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Ionicons name="people-outline" size={14} color={AppColors.primary} />
            <Text style={styles.trustText}>10K+ Families</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Ionicons name="medkit-outline" size={14} color={AppColors.primary} />
            <Text style={styles.trustText}>Doctor Built</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  breatheOrb: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.5,
    backgroundColor: `${AppColors.primaryContainer}50`,
  },
  orbAccentSmall: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.06,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${AppColors.secondaryContainer}30`,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDotsContainer: {
    alignItems: 'center',
    gap: 5,
  },
  logoDot: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 999,
  },
  logoDotLarge: {
    width: 11,
    height: 11,
  },
  logoDotSmall: {
    width: 8,
    height: 8,
  },
  logoDotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  brandSection: {
    alignItems: 'center',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandLight: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 34,
    color: AppColors.onSurfaceVariant,
    letterSpacing: -0.8,
  },
  brandBold: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 34,
    color: AppColors.primary,
    letterSpacing: -0.8,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  ctaSection: {
    gap: 14,
    paddingBottom: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
    paddingVertical: 14,
  },
  secondaryButtonLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurface,
  },
  footer: {
    paddingHorizontal: 20,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: AppColors.outlineVariant,
  },
});
