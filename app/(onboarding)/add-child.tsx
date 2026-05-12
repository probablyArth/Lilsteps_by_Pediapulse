import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AvatarStack } from '@/components/avatar-stack';
import { OnboardingShell } from '@/components/onboarding-shell';
import { AppColors } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const SETUP_ITEMS: { icon: IoniconName; title: string; subtitle: string }[] = [
  {
    icon: 'person-outline',
    title: 'Basics & birth',
    subtitle: 'Name, age, biological details',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Vaccines & milestones',
    subtitle: "What's done, what's next",
  },
  {
    icon: 'trending-up-outline',
    title: 'Growth tracking',
    subtitle: 'Weight, height, development',
  },
  {
    icon: 'medkit-outline',
    title: 'Health history',
    subtitle: 'Allergies, conditions, diet',
  },
];

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
      subtitle="A few quick questions help us personalise care for your little one."
      ctaLabel="Let's begin"
      onCta={() => router.push('/(onboarding)/child-basics')}
      footerExtra={<TrustBadge />}
    >
      <View style={styles.eyebrowRow}>
        <Text style={styles.eyebrow}>HERE&apos;S WHAT WE&apos;LL CAPTURE</Text>
        <View style={styles.eyebrowMeta}>
          <Ionicons name="time-outline" size={12} color={AppColors.onSurfaceVariant} />
          <Text style={styles.eyebrowMetaText}>~3 min</Text>
        </View>
      </View>

      <View style={styles.list}>
        {SETUP_ITEMS.map((item, idx) => (
          <Animated.View
            key={item.title}
            entering={FadeInUp.delay(120 * idx).duration(400)}
            style={[styles.row, idx === 0 && styles.rowFirst]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={AppColors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{idx + 1}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="lock-closed-outline" size={14} color={AppColors.primary} />
        <Text style={styles.noteText}>
          Your child&apos;s data is encrypted and never shared without your consent.
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  eyebrow: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.6,
    color: AppColors.primary,
  },
  eyebrowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eyebrowMetaText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
  },
  list: {
    backgroundColor: `${AppColors.surfaceContainerLowest}CC`,
    borderRadius: 22,
    padding: 6,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rowFirst: {},
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${AppColors.primaryContainer}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: AppColors.onSurface,
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: AppColors.primary,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  noteText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    lineHeight: 18,
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
