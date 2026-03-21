import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { GradientButton } from '@/components/gradient-button';
import { TextInputField } from '@/components/text-input-field';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';
import { useAuth } from '@/context/auth';
import { dbg } from '@/lib/debug';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithOtp, verifyOtp } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    dbg.auth('Login: sending OTP', { email: email.trim().toLowerCase() });
    const { error: err } = await signInWithOtp(email.trim().toLowerCase());
    setLoading(false);

    if (err) {
      dbg.authError('Login: OTP send failed', err);
      setError(err);
    } else {
      dbg.auth('Login: OTP sent, showing code input');
      setStep('otp');
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError(null);

    dbg.auth('Login: verifying OTP', { email: email.trim().toLowerCase(), otpLength: otp.length });
    const { error: err, isNewUser } = await verifyOtp(email.trim().toLowerCase(), otp);
    setLoading(false);

    if (err) {
      dbg.authError('Login: OTP verify failed', err);
      setError(err);
    } else if (isNewUser) {
      dbg.nav('Login → Onboarding (new user)');
      router.replace('/(onboarding)/parent-details');
    } else {
      dbg.nav('Login → Tabs (returning user)');
      router.replace('/(tabs)');
    }
  }

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
            <Pressable onPress={() => step === 'otp' ? setStep('email') : router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>{'\u2190'}</Text>
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.titleSection}>
            <Text style={typography.headingXL}>
              {step === 'email' ? 'Welcome\nBack' : 'Enter\nCode'}
            </Text>
            <Text style={[typography.bodySM, styles.subtitle]}>
              {step === 'email'
                ? 'Sign in with your email to continue'
                : `We sent a 6-digit code to ${email}`}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.form}>
            {step === 'email' ? (
              <View style={styles.fields}>
                <TextInputField
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            ) : (
              <View style={styles.fields}>
                <TextInputField
                  label="Verification Code"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                  autoFocus
                />
              </View>
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <GradientButton
              label={loading ? '' : step === 'email' ? 'Send Code' : 'Verify'}
              onPress={step === 'email' ? handleSendOtp : handleVerifyOtp}
              style={styles.submitButton}
            />
            {loading && (
              <ActivityIndicator
                color={AppColors.onPrimary}
                style={styles.loadingOverlay}
              />
            )}

            {step === 'otp' && (
              <Pressable onPress={handleSendOtp} style={styles.resendButton}>
                <Text style={styles.resendText}>Didn&apos;t receive it? Resend code</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.footer}>
            <Text style={typography.bodySM}>Don&apos;t have an account?</Text>
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
  submitButton: {
    marginTop: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.tertiary,
    marginTop: 10,
    textAlign: 'center',
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.primary,
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
