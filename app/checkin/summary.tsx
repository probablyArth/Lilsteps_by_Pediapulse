import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDoctors, useTimeSlots } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckin } from '@/hooks/useCheckin';

function getNextDays(n: number) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : labels[d.getDay()],
      sub: `${d.getDate()} ${months[d.getMonth()]}`,
      isoDate: d.toISOString().split('T')[0],
    };
  });
}

const DAYS = getNextDays(5);

export default function CheckinSummaryScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useChild();
  const checkin = useCheckin(child);
  const { doctors, loading: loadingDocs } = useDoctors();
  const { bookAppointment } = useAppointments(child?.id ?? null);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [booking, setBooking] = useState(false);

  // Auto-select first doctor
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) ?? doctors[0] ?? null;

  // Fetch time slots for selected doctor + date
  const { slots, loading: loadingSlots } = useTimeSlots(
    selectedDoctorId,
    DAYS[selectedDay].isoDate
  );

  // Reset slot selection when doctor or day changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDoctorId, selectedDay]);

  const summary = checkin.summary;
  const childName = child?.name ?? 'Child';

  async function handleConfirm() {
    if (!selectedSlot || !selectedDoctor || !child) return;
    setBooking(true);
    try {
      await bookAppointment({
        child_id: child.id,
        doctor_id: selectedDoctor.id,
        date: DAYS[selectedDay].isoDate,
        time: selectedSlot,
        ai_summary_id: checkin.sessionId ?? undefined,
      });
      setConfirmed(true);
    } catch {
      // booking failed
    } finally {
      setBooking(false);
    }
  }

  if (confirmed) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>All set!</Text>
          <Text style={styles.successSub}>
            {childName}&apos;s summary has been sent to {selectedDoctor?.name ?? 'the doctor'}.
          </Text>
          <View style={styles.successCard}>
            <SuccessRow icon="person-outline" label="Doctor" value={selectedDoctor?.name ?? ''} />
            <SuccessRow icon="calendar-outline" label="Date" value={`${DAYS[selectedDay].label}, ${DAYS[selectedDay].sub}`} />
            <SuccessRow icon="time-outline" label="Time" value={selectedSlot ?? ''} />
          </View>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.doneBtnText}>Go to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Pre-visit Summary</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        {summary ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <LinearGradient
                colors={[AppColors.primary, '#8b3cf7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryGradBar}
              />
              <View style={styles.summaryCardHeaderInner}>
                <View style={styles.summaryTitleRow}>
                  <Ionicons name="sparkles" size={14} color={AppColors.primary} />
                  <Text style={styles.summaryChip}>AI Summary · {childName}</Text>
                </View>
                <Text style={styles.summaryComplaint}>{summary.chiefComplaint}</Text>
              </View>
            </View>

            <View style={styles.summaryBody}>
              {summary.details.map((d) => (
                <View key={d.label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailValue}>{d.value}</Text>
                </View>
              ))}

              {summary.relevantHistory && (
                <View style={styles.historyRow}>
                  <Ionicons name="time-outline" size={13} color={AppColors.primary} />
                  <Text style={styles.historyText}>{summary.relevantHistory}</Text>
                </View>
              )}

              {summary.allergyNote && (
                <View style={styles.allergyRow}>
                  <Ionicons name="warning-outline" size={13} color="#d97706" />
                  <Text style={styles.allergyText}>{summary.allergyNote}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={AppColors.primary} />
            <Text style={styles.loadingText}>Loading summary…</Text>
          </View>
        )}

        {/* Doctor picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Doctor</Text>
          {loadingDocs ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <View style={styles.doctorRow}>
              {doctors.map((doc) => (
                <Pressable
                  key={doc.id}
                  style={[styles.doctorChip, selectedDoctorId === doc.id && styles.doctorChipActive]}
                  onPress={() => setSelectedDoctorId(doc.id)}
                >
                  <View style={styles.docAvatar}>
                    <Text style={styles.docAvatarText}>{doc.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.docSpec} numberOfLines={1}>{doc.specialisation}</Text>
                  </View>
                  {selectedDoctorId === doc.id && <Ionicons name="checkmark-circle" size={18} color={AppColors.primary} />}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick a Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {DAYS.map((d, i) => (
              <Pressable
                key={i}
                style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
                onPress={() => setSelectedDay(i)}
              >
                <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d.label}</Text>
                <Text style={[styles.dayDate, selectedDay === i && styles.dayDateActive]}>{d.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Time slot picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick a Time</Text>
          {loadingSlots ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No available slots for this date</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => (
                <Pressable
                  key={slot.id}
                  disabled={!slot.is_available}
                  style={[
                    styles.slotChip,
                    !slot.is_available && styles.slotDisabled,
                    selectedSlot === slot.time && styles.slotSelected,
                  ]}
                  onPress={() => setSelectedSlot(slot.time)}
                >
                  <Text style={[
                    styles.slotText,
                    !slot.is_available && styles.slotTextDisabled,
                    selectedSlot === slot.time && styles.slotTextSelected,
                  ]}>
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.confirmBtn, !selectedSlot && styles.confirmBtnDisabled, { opacity: pressed ? 0.88 : 1 }]}
          disabled={!selectedSlot || booking}
          onPress={handleConfirm}
        >
          <LinearGradient
            colors={selectedSlot ? [AppColors.primary, '#8b3cf7'] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmGrad}
          >
            {booking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[styles.confirmText, !selectedSlot && styles.confirmTextDisabled]}>Confirm Booking</Text>
                <Ionicons name="arrow-forward" size={18} color={selectedSlot ? '#fff' : AppColors.onSurfaceVariant} />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 24 },

  loadingSection: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  loadingText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },
  noSlotsText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurfaceVariant, textAlign: 'center' },

  summaryCard: {
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    borderLeftWidth: 3, borderLeftColor: AppColors.primary,
  },
  summaryCardHeader: { flexDirection: 'row' },
  summaryGradBar: { width: 3, alignSelf: 'stretch' },
  summaryCardHeaderInner: { flex: 1, padding: 16, gap: 4 },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryChip: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.primary },
  summaryComplaint: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onSurface, letterSpacing: -0.3 },
  summaryBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 0 },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  detailLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant, flex: 1 },
  detailValue: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurface, flex: 2, textAlign: 'right' },

  historyRow: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginTop: 12, backgroundColor: `${AppColors.primary}08`, borderRadius: 10, padding: 10,
  },
  historyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurface, flex: 1, lineHeight: 17 },

  allergyRow: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginTop: 8, backgroundColor: '#fef3c710', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#fde68a',
  },
  allergyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#92400e', flex: 1, lineHeight: 17 },

  section: { gap: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },

  doctorRow: { gap: 10 },
  doctorChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  doctorChipActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}06` },
  docAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${AppColors.primaryContainer}50`, alignItems: 'center', justifyContent: 'center',
  },
  docAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary },
  docName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  docSpec: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },

  dateRow: { gap: 10 },
  dayChip: {
    alignItems: 'center', gap: 3, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: 'transparent', minWidth: 74,
  },
  dayChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  dayLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.onSurface },
  dayLabelActive: { color: '#fff' },
  dayDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: AppColors.onSurfaceVariant },
  dayDateActive: { color: 'rgba(255,255,255,0.8)' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30`,
  },
  slotDisabled: { backgroundColor: `${AppColors.surfaceContainerHigh}80`, borderColor: 'transparent' },
  slotSelected: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  slotText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurface },
  slotTextDisabled: { color: `${AppColors.onSurfaceVariant}50` },
  slotTextSelected: { color: '#fff' },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20`,
  },
  confirmBtn: { borderRadius: 999, overflow: 'hidden' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  confirmText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
  confirmTextDisabled: { color: AppColors.onSurfaceVariant },

  // Success screen
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#bbf7d0',
  },
  successTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: AppColors.onSurface },
  successSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  successCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 18, gap: 2 },
  successRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  successRowLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant, flex: 1 },
  successRowValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'right', flex: 2 },
  doneBtn: { width: '100%', backgroundColor: AppColors.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
});
