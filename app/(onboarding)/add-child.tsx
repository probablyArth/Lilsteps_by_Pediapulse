import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { AvatarStack } from '@/components/avatar-stack';
import { OnboardingShell } from '@/components/onboarding-shell';
import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';

function TrustBadge() {
  return (
    <View style={styles.trustBadge}>
      <AvatarStack badgeLabel="+2k" />
      <Text style={styles.trustText}>TRUSTED BY 2,000+ PARENTS</Text>
    </View>
  );
}

export default function AddChildScreen() {
  return (
    <OnboardingShell
      progress={0.1}
      title="Add Your First Child"
      subtitle="Let's set up your child's profile so we're ready when you need us."
      ctaLabel="Add Child"
      onCta={() => router.push('/(onboarding)/child-basics')}
      footerExtra={<TrustBadge />}
    >
      <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.illustration}>
        <LinearGradient
          colors={[AppColors.primaryContainer, AppColors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Text style={styles.iconEmoji}>{'\u{1F476}'}</Text>
        </LinearGradient>
        <Text style={[typography.bodyMD, styles.helperText]}>
          Adding your child&apos;s health profile helps doctors give faster, safer care during consultations.
        </Text>
      </Animated.View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    gap: 24,
    marginTop: 32,
  },
  iconCircle: {
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
  iconEmoji: {
    fontSize: 40,
  },
  helperText: {
    textAlign: 'center',
    maxWidth: 280,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 4,
  },
  trustText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: AppColors.onSurfaceVariant,
  },
});
