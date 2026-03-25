/**
 * Booking Confirmation — Step 3 of booking
 *
 * Displays full summary and routes to payment.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';

const DOCTOR_INFO: Record<string, { name: string; role: string; hospital: string; experience: string }> = {
  'dr-madhav': { name: 'Dr. Madhav Sharma', role: 'Senior Pediatrician', hospital: 'LilSteps Care Clinic', experience: '14 yrs' },
  'dr-shilpa': { name: 'Dr. Shilpa Rao',    role: 'Nutritionist',        hospital: 'LilSteps Nutrition Hub', experience: '9 yrs' },
  'dr-amit':   { name: 'Dr. Amit Verma',     role: 'Growth Specialist',   hospital: 'LilSteps Growth Centre', experience: '11 yrs' },
  'dr-harsh':  { name: 'Dr. Harsh Vardhan',  role: 'Sleep Consultant',    hospital: 'LilSteps Wellness Clinic', experience: '16 yrs' },
};

const CONSULT_FEE = 400;

export default function ConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useChild();
  const { doctorId, dateLabel, time, issue } = useLocalSearchParams<{
    doctorId: string;
    dateIso: string;
    dateLabel: string;
    time: string;
    issue: string;
  }>();

  const doctor = DOCTOR_INFO[doctorId] ?? { name: 'Doctor', role: '', hospital: '', experience: '' };
  const childName = child?.name ?? 'Your child';
  const issueText = issue ? decodeURIComponent(issue) : '';

  function goToPayment() {
    router.push(
      `/consult/payment?doctorId=${doctorId}&dateLabel=${encodeURIComponent(dateLabel ?? '')}&time=${encodeURIComponent(time ?? '')}`
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, s <= 3 && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Almost there!</Text>
        <Text style={styles.pageSub}>Review your booking details before proceeding to payment.</Text>

        {/* Doctor summary card */}
        <View style={styles.doctorCard}>
          <LinearGradient
            colors={[`${AppColors.primary}20`, `${AppColors.primary}08`]}
            style={styles.docAvatarBg}
          >
            <Text style={styles.docAvatarInitial}>{doctor.name.split(' ')[1]?.charAt(0) ?? 'D'}</Text>
          </LinearGradient>
          <View style={styles.docDetails}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docRole}>{doctor.role}</Text>
            <Text style={styles.docHospital}>{doctor.hospital}</Text>
          </View>
          <View style={styles.expBadge}>
            <Text style={styles.expBadgeText}>{doctor.experience}</Text>
          </View>
        </View>

        {/* Booking details card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardLabel}>Appointment Details</Text>
          <DetailRow icon="person-outline"      label="Patient"     value={childName} />
          <DetailRow icon="calendar-outline"    label="Date"        value={dateLabel ?? ''} />
          <DetailRow icon="time-outline"        label="Time"        value={time ?? ''} />
          <DetailRow icon="videocam-outline"    label="Mode"        value="Video Consultation" />
          <DetailRow icon="hourglass-outline"   label="Duration"    value="30 minutes" />
        </View>

        {/* Issue summary */}
        {issueText.length > 0 && (
          <View style={styles.issueCard}>
            <View style={styles.issueTitleRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={AppColors.primary} />
              <Text style={styles.issueTitleText}>Your concern</Text>
            </View>
            <Text style={styles.issueBody}>{issueText}</Text>
          </View>
        )}

        {/* Fee breakdown */}
        <View style={styles.feeCard}>
          <Text style={styles.cardLabel}>Fee Breakdown</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeItem}>Consultation fee</Text>
            <Text style={styles.feeAmount}>₹{CONSULT_FEE}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeItem}>Platform fee</Text>
            <Text style={[styles.feeAmount, { color: AppColors.successGreen }]}>Free</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeTotalLabel}>Total payable</Text>
            <Text style={styles.feeTotalAmount}>₹{CONSULT_FEE}</Text>
          </View>
        </View>

        {/* Policy note */}
        <View style={styles.policyNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={AppColors.primary} />
          <Text style={styles.policyText}>
            Secure payment · Free cancellation up to 2 hours before the appointment.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.payBtn, { opacity: pressed ? 0.87 : 1 }]}
          onPress={goToPayment}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payBtnGrad}
          >
            <Ionicons name="lock-closed-outline" size={16} color={AppColors.onPrimary} />
            <Text style={styles.payBtnText}>Proceed to Pay · ₹{CONSULT_FEE}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <Ionicons name={icon as any} size={16} color={AppColors.primary} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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

  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: `${AppColors.outlineVariant}30` },
  stepDotActive: { backgroundColor: AppColors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },

  pageTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: AppColors.onSurface, letterSpacing: -0.5 },
  pageSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant, lineHeight: 20, marginTop: -8 },

  // Doctor card
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 18,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
  },
  docAvatarBg: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarInitial: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: AppColors.primary },
  docDetails: { flex: 1, gap: 2 },
  docName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  docRole: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },
  docHospital: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  expBadge: {
    backgroundColor: `${AppColors.primary}12`, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  expBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: AppColors.primary },

  // Details card
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 18, gap: 2,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurfaceVariant, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  detailIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: `${AppColors.primary}10`, alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant, flex: 1 },
  detailValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'right', maxWidth: '55%' },

  // Issue card
  issueCard: {
    backgroundColor: `${AppColors.primary}08`, borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: `${AppColors.primary}15`,
  },
  issueTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  issueTitleText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary },
  issueBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurface, lineHeight: 20 },

  // Fee card
  feeCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 18, gap: 8,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feeItem: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant },
  feeAmount: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.onSurface },
  feeDivider: { height: 1, backgroundColor: `${AppColors.outlineVariant}25`, marginVertical: 4 },
  feeTotalLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  feeTotalAmount: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.primary },

  policyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: `${AppColors.primary}08`, borderRadius: 12, padding: 14,
  },
  policyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, lineHeight: 18, flex: 1 },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}15`,
  },
  payBtn: { borderRadius: 999, overflow: 'hidden' },
  payBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  payBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onPrimary },
});
