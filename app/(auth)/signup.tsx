import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={layout.screenContainer}>
      <GradientBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>{'\u2190'}</Text>
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.titleSection}>
            <Text style={typography.headingXL}>Create{'\n'}Account</Text>
            <Text style={[typography.bodySM, styles.subtitle]}>
              Join thousands of parents protecting their children's health
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.form}>
            <View style={styles.fields}>
              <TextInputField
                label="Your Name"
                hint="(Parent or Guardian)"
                placeholder="e.g. Sarah Johnson"
                autoCapitalize="words"
                autoComplete="name"
              />
              <TextInputField
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInputField
                label="Password"
                placeholder="Min. 8 characters"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <GradientButton
              label="Create Account"
              onPress={() => router.push('/(onboarding)/parent-details')}
              style={styles.submitButton}
            />

            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.footer}>
            <Text style={typography.bodySM}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${AppColors.surfaceContainerLowest}B3`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}26`,
  },
  backArrow: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 20,
    color: AppColors.onSurface,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
  },
  form: {},
  fields: {
    gap: 14,
  },
  submitButton: {
    marginTop: 24,
  },
  termsText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  termsLink: {
    color: AppColors.primary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  linkText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: AppColors.primary,
  },
});
