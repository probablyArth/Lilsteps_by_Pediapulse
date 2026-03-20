import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { AppColors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';
import { typography } from '@/styles/global';

function getAge(dob: Date): string {
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (totalMonths < 1) return 'Newborn';
  if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
  return `${years}y ${months}m old`;
}

export default function ConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { childName, childSex, dob, weight, bloodGroup, allergies, conditions } = useOnboarding();
  const [agreed, setAgreed] = useState(false);

  const displayName = childName || 'Your child';
  const initial = displayName.charAt(0).toUpperCase();
  const age = dob ? getAge(dob) : null;
  const sexLabel = childSex === 'male' ? 'Male' : childSex === 'female' ? 'Female' : null;

  const hasAllergies = allergies.length > 0;
  const hasConditions = conditions.length > 0;

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header label */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.headerLabel}>
          <Text style={styles.headerLabelText}>Profile Ready</Text>
        </Animated.View>

        {/* Child profile card */}
        <Animated.View entering={FadeInUp.delay(150).duration(600)} style={styles.card}>
          {/* Avatar + identity */}
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </LinearGradient>

          <Text style={styles.childName}>{displayName}</Text>
          {(age || sexLabel) && (
            <Text style={styles.childMeta}>
              {[age, sexLabel].filter(Boolean).join(' · ')}
            </Text>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{weight ? `${weight} kg` : '—'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Blood Group</Text>
              <Text style={styles.statValue}>{bloodGroup || '—'}</Text>
            </View>
          </View>

          {/* Allergies */}
          {hasAllergies && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.alertDot}>{'\u26A0\uFE0F'}</Text>
                  <Text style={styles.allergyTitle}>ALLERGY ALERT</Text>
                </View>
                <View style={styles.chipRow}>
                  {allergies.map((a) => (
                    <View key={a} style={styles.allergyChip}>
                      <Text style={styles.allergyChipText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Conditions */}
          {hasConditions && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chronic Conditions</Text>
                {conditions.map((c) => (
                  <View key={c} style={styles.conditionRow}>
                    <View style={styles.conditionDot} />
                    <Text style={styles.conditionText}>{c}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* No flags message */}
          {!hasAllergies && !hasConditions && (
            <>
              <View style={styles.divider} />
              <Text style={styles.noFlagsText}>No known allergies or chronic conditions</Text>
            </>
          )}
        </Animated.View>

        {/* Accuracy checkbox */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.checkboxSection}>
          <Pressable style={styles.checkboxRow} onPress={() => setAgreed((v) => !v)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>{'\u2713'}</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              All details are accurate to the best of my knowledge
            </Text>
          </Pressable>

          <Text style={styles.termsText}>
            By continuing you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(550).duration(500)}>
          <GradientButton
            label={`${displayName} is ready. Let's go.`}
            onPress={() => router.replace('/(onboarding)/complete')}
            style={[styles.cta, !agreed && styles.ctaDisabled]}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  headerLabel: {
    alignItems: 'center',
  },
  headerLabelText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: AppColors.primary,
  },
  card: {
    backgroundColor: `${AppColors.surfaceContainerLowest}CC`,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}33`,
    alignItems: 'center',
    gap: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: AppColors.onPrimary,
  },
  childName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    color: AppColors.onSurface,
    letterSpacing: -0.3,
  },
  childMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: `${AppColors.outlineVariant}33`,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: `${AppColors.outlineVariant}33`,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: AppColors.onSurface,
  },
  section: {
    width: '100%',
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertDot: {
    fontSize: 14,
  },
  allergyTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: AppColors.tertiary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: `${AppColors.tertiaryContainer}66`,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${AppColors.tertiary}33`,
  },
  allergyChipText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.tertiary,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: AppColors.onSurfaceVariant,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primary,
  },
  conditionText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  noFlagsText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  checkboxSection: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppColors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  checkmark: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.onPrimary,
  },
  checkboxLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurface,
    flex: 1,
    lineHeight: 20,
  },
  termsText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: AppColors.primary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  cta: {
    marginTop: 4,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
});
