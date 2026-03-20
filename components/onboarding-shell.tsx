import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';

interface OnboardingShellProps {
  progress: number;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  onCta: () => void;
  subLink?: { label: string; onPress: () => void };
  footerExtra?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
}

export function OnboardingShell({
  progress,
  title,
  subtitle,
  ctaLabel,
  onCta,
  subLink,
  footerExtra,
  onBack,
  children,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <GradientBackground />

      <View style={[styles.inner, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack ?? (() => router.back())} style={styles.backButton}>
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={typography.headingLG}>{title}</Text>
            {subtitle && <Text style={[typography.bodySM, styles.subtitle]}>{subtitle}</Text>}
          </Animated.View>

          <View style={styles.content}>{children}</View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <GradientButton label={ctaLabel} onPress={onCta} />
          {subLink && (
            <Pressable onPress={subLink.onPress} style={styles.subLinkButton}>
              <Text style={styles.subLinkText}>{subLink.label}</Text>
            </Pressable>
          )}
          {footerExtra}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerLowest}B3`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}26`,
  },
  backArrow: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: AppColors.onSurface,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${AppColors.outlineVariant}33`,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: AppColors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  subtitle: {
    marginTop: 6,
  },
  content: {
    marginTop: 24,
    gap: 20,
  },
  footer: {
    paddingTop: 12,
    gap: 12,
  },
  subLinkButton: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  subLinkText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.primary,
  },
});
