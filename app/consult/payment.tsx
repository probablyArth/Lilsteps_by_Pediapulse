/**
 * Payment Screen — Step 4 of booking
 *
 * Shows ₹400 payment with UPI / Card / Net Banking options.
 * On success shows confirmation screen and navigates home.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

const CONSULT_FEE = 400;

type PayMethod = 'upi' | 'card' | 'netbanking';

const DOCTOR_NAMES: Record<string, string> = {
  'dr-madhav': 'Dr. Madhav Sharma',
  'dr-shilpa': 'Dr. Shilpa Rao',
  'dr-amit':   'Dr. Amit Verma',
  'dr-harsh':  'Dr. Harsh Vardhan',
};

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const { doctorId, dateLabel, time } = useLocalSearchParams<{
    doctorId: string;
    dateLabel: string;
    time: string;
  }>();

  const [method, setMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const doctorName = DOCTOR_NAMES[doctorId] ?? 'Doctor';

  async function handlePay() {
    setPaying(true);
    // Simulated payment delay
    await new Promise((r) => setTimeout(r, 2000));
    setPaying(false);
    setSuccess(true);
  }

  // ── Success screen ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={[styles.screen, styles.successScreen, { paddingTop: insets.top }]}>
        <View style={styles.successIconWrap}>
          <LinearGradient colors={[AppColors.successGreen, AppColors.successGreenBright]} style={styles.successIconGrad}>
            <Ionicons name="checkmark" size={44} color={AppColors.onPrimary} />
          </LinearGradient>
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSub}>Your consultation has been booked successfully.</Text>

        <View style={styles.successCard}>
          <SuccessRow icon="person-outline"   label="Doctor"  value={doctorName} />
          <SuccessRow icon="calendar-outline" label="Date"    value={dateLabel ?? ''} />
          <SuccessRow icon="time-outline"     label="Time"    value={time ?? ''} />
          <SuccessRow icon="cash-outline"     label="Paid"    value={`₹${CONSULT_FEE}`} />
        </View>

        <Pressable style={styles.calBtn}>
          <Ionicons name="calendar-outline" size={16} color={AppColors.primary} />
          <Text style={styles.calBtnText}>Add to Calendar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <LinearGradient colors={[AppColors.primary, AppColors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.doneBtnGrad}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // ── Payment form ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.secureChip}>
          <Ionicons name="lock-closed" size={11} color={AppColors.successGreen} />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      {/* Step indicator — all 4 active */}
      <View style={styles.steps}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount banner */}
        <LinearGradient
          colors={[AppColors.primary, AppColors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountBanner}
        >
          <View style={styles.amountTop}>
            <View>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>₹{CONSULT_FEE}</Text>
            </View>
            <View style={styles.amountRight}>
              <Text style={styles.amountDoctor}>{doctorName}</Text>
              <Text style={styles.amountSlot}>{dateLabel}</Text>
              <Text style={styles.amountSlot}>{time}</Text>
            </View>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountBreakRow}>
            <Text style={styles.amountBreakItem}>Consultation  <Text style={styles.amountBreakBold}>₹{CONSULT_FEE}</Text></Text>
            <Text style={styles.amountBreakItem}>Platform fee  <Text style={[styles.amountBreakBold, { color: AppColors.successGreenBright }]}>Free</Text></Text>
          </View>
        </LinearGradient>

        {/* Payment method selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          <MethodCard
            active={method === 'upi'}
            icon="phone-portrait-outline"
            label="UPI"
            desc="GPay, PhonePe, Paytm, BHIM"
            onSelect={() => setMethod('upi')}
          />
          <MethodCard
            active={method === 'card'}
            icon="card-outline"
            label="Credit / Debit Card"
            desc="Visa, Mastercard, RuPay"
            onSelect={() => setMethod('card')}
          />
          <MethodCard
            active={method === 'netbanking'}
            icon="business-outline"
            label="Net Banking"
            desc="All major Indian banks"
            onSelect={() => setMethod('netbanking')}
          />
        </View>

        {/* Method-specific input */}
        {method === 'upi' && (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Enter UPI ID</Text>
            <View style={styles.inputRow}>
              <Ionicons name="at-outline" size={18} color={AppColors.onSurfaceVariant} />
              <TextInput
                style={styles.input}
                placeholder="yourname@upi"
                placeholderTextColor={`${AppColors.onSurfaceVariant}70`}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={upiId}
                onChangeText={setUpiId}
              />
            </View>
            <Text style={styles.inputHint}>Example: name@okicici, 9876543210@ybl</Text>
          </View>
        )}

        {method === 'card' && (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Card Details</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={18} color={AppColors.onSurfaceVariant} />
              <TextInput style={styles.input} placeholder="Card number" placeholderTextColor={`${AppColors.onSurfaceVariant}70`} keyboardType="number-pad" />
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.inputRow, { flex: 1 }]}>
                <TextInput style={styles.input} placeholder="MM / YY" placeholderTextColor={`${AppColors.onSurfaceVariant}70`} keyboardType="number-pad" />
              </View>
              <View style={[styles.inputRow, { flex: 1 }]}>
                <TextInput style={styles.input} placeholder="CVV" placeholderTextColor={`${AppColors.onSurfaceVariant}70`} keyboardType="number-pad" secureTextEntry />
              </View>
            </View>
          </View>
        )}

        {method === 'netbanking' && (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Select Bank</Text>
            {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Other'].map((bank) => (
              <Pressable key={bank} style={styles.bankRow}>
                <Text style={styles.bankLabel}>{bank}</Text>
                <Ionicons name="chevron-forward" size={16} color={`${AppColors.onSurfaceVariant}60`} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Trust badges */}
        <View style={styles.trustRow}>
          <TrustBadge icon="shield-checkmark-outline" label="256-bit SSL" />
          <TrustBadge icon="lock-closed-outline" label="PCI DSS Safe" />
          <TrustBadge icon="reload-outline" label="Easy Refund" />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.payBtn, { opacity: pressed && !paying ? 0.87 : 1 }]}
          onPress={handlePay}
          disabled={paying}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payBtnGrad}
          >
            {paying ? (
              <ActivityIndicator size="small" color={AppColors.onPrimary} />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={16} color={AppColors.onPrimary} />
                <Text style={styles.payBtnText}>Pay ₹{CONSULT_FEE}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
        <Text style={styles.footerNote}>By paying you agree to our Terms of Service & Refund Policy.</Text>
      </View>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function MethodCard({ active, icon, label, desc, onSelect }: {
  active: boolean; icon: string; label: string; desc: string; onSelect: () => void;
}) {
  return (
    <Pressable
      style={[styles.methodCard, active && styles.methodCardActive]}
      onPress={onSelect}
    >
      <View style={[styles.methodIcon, active && styles.methodIconActive]}>
        <Ionicons name={icon as any} size={20} color={active ? AppColors.onPrimary : AppColors.onSurfaceVariant} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={[styles.methodLabel, active && { color: AppColors.primary }]}>{label}</Text>
        <Text style={styles.methodDesc}>{desc}</Text>
      </View>
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

function SuccessRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.successRow}>
      <Ionicons name={icon as any} size={15} color={AppColors.onSurfaceVariant} />
      <Text style={styles.successRowLabel}>{label}</Text>
      <Text style={styles.successRowValue}>{value}</Text>
    </View>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.trustBadge}>
      <Ionicons name={icon as any} size={14} color={AppColors.primary} />
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },
  secureChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: AppColors.successGreenSurface, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  secureText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: AppColors.successGreen },

  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: `${AppColors.outlineVariant}30` },
  stepDotActive: { backgroundColor: AppColors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },

  // Amount banner
  amountBanner: { borderRadius: 20, padding: 20, gap: 14 },
  amountTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  amountLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  amountValue: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 36, color: AppColors.onPrimary, letterSpacing: -1 },
  amountRight: { alignItems: 'flex-end', gap: 3 },
  amountDoctor: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onPrimary },
  amountSlot: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  amountDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  amountBreakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountBreakItem: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  amountBreakBold: { fontFamily: 'PlusJakartaSans_700Bold', color: AppColors.onPrimary },

  // Payment methods
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  methodCardActive: { borderColor: `${AppColors.primary}40`, backgroundColor: `${AppColors.primary}05` },
  methodIcon: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 0,
    backgroundColor: AppColors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: AppColors.primary },
  methodInfo: { flex: 1, gap: 2 },
  methodLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  methodDesc: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: AppColors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: AppColors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.primary },

  // Input card
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 16, gap: 12,
  },
  inputLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurfaceVariant },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppColors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurface },
  inputHint: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
  cardRow: { flexDirection: 'row', gap: 10 },

  // Net banking banks
  bankRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  bankLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurface },

  // Trust badges
  trustRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${AppColors.primary}08`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  trustBadgeText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: AppColors.primary },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12, gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}15`,
  },
  payBtn: { borderRadius: 999, overflow: 'hidden' },
  payBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17 },
  payBtnText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: AppColors.onPrimary, letterSpacing: -0.2 },
  footerNote: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant, textAlign: 'center' },

  // Success screen
  successScreen: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  successIconWrap: { borderRadius: 999, overflow: 'hidden' },
  successIconGrad: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: AppColors.onSurface, textAlign: 'center', letterSpacing: -0.5 },
  successSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, color: AppColors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginTop: -8 },
  successCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20, gap: 4,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  successRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  successRowLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant, flex: 1 },
  successRowValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'right', flex: 2 },
  calBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 999, borderWidth: 1.5, borderColor: `${AppColors.primary}35`,
  },
  calBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.primary },
  doneBtn: { width: '100%', borderRadius: 999, overflow: 'hidden' },
  doneBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onPrimary },
});
