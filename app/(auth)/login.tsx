import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';

export default function LoginScreen() {
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
            <Text style={typography.headingXL}>Welcome{'\n'}Back</Text>
            <Text style={[typography.bodySM, styles.subtitle]}>
              Sign in to continue caring for your little one
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.form}>
            <View style={styles.fields}>
              <TextInputField
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInputField
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <GradientButton
              label="Sign In"
              onPress={() => {}}
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social login */}
            <Pressable>
              <LinearGradient
                colors={[AppColors.surfaceContainerLow, AppColors.surfaceContainerLowest]}
                style={styles.socialGradient}
              >
                <Text style={[typography.labelLG, { color: AppColors.onSurface }]}>
                  Continue with Google
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.footer}>
            <Text style={typography.bodySM}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.primary,
  },
  submitButton: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${AppColors.outlineVariant}33`,
  },
  dividerText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.outlineVariant,
  },
  socialGradient: {
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}26`,
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
