import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Card } from 'heroui-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDoctors, useTimeSlots } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckin } from '@/hooks/useCheckin';

const HEADER_HEIGHT = 60;

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

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) ?? doctors[0] ?? null;

  const { slots, loading: loadingSlots } = useTimeSlots(
    selectedDoctorId,
    DAYS[selectedDay].isoDate
  );

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
      <View style={styles.screen}>
        <View style={[styles.successContainer, { paddingTop: insets.top + 40 }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={44} color={AppColors.successGreen} />
          </View>
          <Text style={styles.successTitle}>All set!</Text>
          <Text style={styles.successSub}>
            {childName}&apos;s summary has been sent to {selectedDoctor?.name ?? 'the doctor'}.
          </Text>
          <Card style={styles.successCard}>
            <Card.Body style={styles.successCardBody}>
              <SuccessRow icon="person-outline" label="Doctor" value={selectedDoctor?.name ?? ''} />
              <SuccessRow icon="calendar-outline" label="Date" value={`${DAYS[selectedDay].label}, ${DAYS[selectedDay].sub}`} />
              <SuccessRow icon="time-outline" label="Time" value={selectedSlot ?? ''} isLast />
            </Card.Body>
          </Card>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.doneBtnGrad}
            >
              <Text style={styles.doneBtnText}>Go to Home</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <LinearGradient
          colors={[
            AppColors.surface,
            AppColors.surface,
            `${AppColors.surface}E8`,
            `${AppColors.surface}B0`,
            `${AppColors.surface}60`,
            `${AppColors.surface}20`,
            `${AppColors.surface}00`,
          ]}
          locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.header} pointerEvents="box-none">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={AppColors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Pre-visit Summary</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: 100 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
      >
        {summary ? (
          <Card style={styles.summaryCard}>
            <Card.Body style={styles.summaryCardBody}>
              <View style={styles.summaryHeader}>
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={12} color={AppColors.primary} />
                  <Text style={styles.aiBadgeText}>AI Summary</Text>
                </View>
                <Text style={styles.summaryChildName}>{childName}</Text>
              </View>
              <Text style={styles.summaryComplaint}>{summary.chiefComplaint}</Text>
              
              <View style={styles.divider} />

              {summary.details.map((d, i) => (
                <View key={d.label} style={[styles.detailRow, i === summary.details.length - 1 && styles.detailRowLast]}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailValue}>{d.value}</Text>
                </View>
              ))}

              {summary.relevantHistory && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={AppColors.primary} />
                  <Text style={styles.infoText}>{summary.relevantHistory}</Text>
                </View>
              )}

              {summary.allergyNote && (
                <View style={styles.warningRow}>
                  <Ionicons name="warning-outline" size={14} color={AppColors.warningAmber} />
                  <Text style={styles.warningText}>{summary.allergyNote}</Text>
                </View>
              )}
            </Card.Body>
          </Card>
        ) : (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={AppColors.primary} />
            <Text style={styles.loadingText}>Loading summary…</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Doctor</Text>
          {loadingDocs ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <View style={styles.doctorList}>
              {doctors.map((doc) => (
                <Pressable
                  key={doc.id}
                  onPress={() => setSelectedDoctorId(doc.id)}
                >
                  <Card style={[styles.doctorCard, selectedDoctorId === doc.id && styles.doctorCardActive]}>
                    <Card.Body style={styles.doctorCardBody}>
                      <View style={[styles.docAvatar, selectedDoctorId === doc.id && styles.docAvatarActive]}>
                        <Text style={[styles.docAvatarText, selectedDoctorId === doc.id && styles.docAvatarTextActive]}>
                          {doc.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.docInfo}>
                        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                        <Text style={styles.docSpec} numberOfLines={1}>{doc.specialisation}</Text>
                      </View>
                      {selectedDoctorId === doc.id && (
                        <View style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={14} color={AppColors.onPrimary} />
                        </View>
                      )}
                    </Card.Body>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

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

      <View style={styles.footerWrapper} pointerEvents="box-none">
        <LinearGradient
          colors={[
            `${AppColors.surface}00`,
            `${AppColors.surface}40`,
            `${AppColors.surface}B0`,
            AppColors.surface,
          ]}
          locations={[0, 0.25, 0.5, 0.7]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable
            style={({ pressed }) => [styles.confirmBtn, { opacity: pressed && selectedSlot ? 0.88 : 1 }]}
            disabled={!selectedSlot || booking}
            onPress={handleConfirm}
          >
            <LinearGradient
              colors={selectedSlot ? [AppColors.primary, AppColors.gradientEnd] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmGrad}
            >
              {booking ? (
                <ActivityIndicator size="small" color={AppColors.onPrimary} />
              ) : (
                <>
                  <Text style={[styles.confirmText, !selectedSlot && styles.confirmTextDisabled]}>
                    Confirm Booking
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={selectedSlot ? AppColors.onPrimary : AppColors.onSurfaceVariant}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SuccessRow({ icon, label, value, isLast }: { icon: string; label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.successRow, isLast && styles.successRowLast]}>
      <Ionicons name={icon as any} size={16} color={AppColors.onSurfaceVariant} />
      <Text style={styles.successRowLabel}>{label}</Text>
      <Text style={styles.successRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  backBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 17,
    color: AppColors.onSurface,
  },
  headerSpacer: { flex: 1 },

  scroll: { paddingHorizontal: 20, gap: 24 },

  loadingSection: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  loadingText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },

  summaryCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${AppColors.primary}20`,
  },
  summaryCardBody: { padding: 18, gap: 12 },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${AppColors.primary}12`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  aiBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: AppColors.primary,
  },
  summaryChildName: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
  },
  summaryComplaint: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: AppColors.onSurface,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: `${AppColors.outlineVariant}20`,
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    flex: 1,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 2,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: `${AppColors.primary}08`,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  warningRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: `${AppColors.warningAmber}10`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${AppColors.warningAmber}30`,
  },
  warningText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 1,
    lineHeight: 18,
  },

  section: { gap: 14 },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onSurface,
  },

  doctorList: { gap: 10 },
  doctorCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  doctorCardActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}04`,
  },
  doctorCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  docAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarActive: {
    backgroundColor: AppColors.primary,
  },
  docAvatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.primary,
  },
  docAvatarTextActive: {
    color: AppColors.onPrimary,
  },
  docInfo: { flex: 1, gap: 2 },
  docName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  docSpec: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
  },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  dateRow: { gap: 10 },
  dayChip: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
    minWidth: 78,
  },
  dayChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  dayLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurface,
  },
  dayLabelActive: { color: AppColors.onPrimary },
  dayDate: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
  },
  dayDateActive: { color: `${AppColors.onPrimary}B0` },

  noSlotsText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 20,
  },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}20`,
  },
  slotDisabled: {
    backgroundColor: AppColors.surfaceContainerHigh,
    borderColor: 'transparent',
  },
  slotSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  slotText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurface,
  },
  slotTextDisabled: { color: `${AppColors.onSurfaceVariant}50` },
  slotTextSelected: { color: AppColors.onPrimary },

  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  confirmBtn: { borderRadius: 999, overflow: 'hidden' },
  confirmGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  confirmText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },
  confirmTextDisabled: { color: AppColors.onSurfaceVariant },

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: `${AppColors.successGreen}15`,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
    color: AppColors.onSurface,
    letterSpacing: -0.5,
  },
  successSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  successCard: {
    width: '100%',
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    marginTop: 8,
  },
  successCardBody: { padding: 6 },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  successRowLast: { borderBottomWidth: 0 },
  successRowLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    flex: 1,
  },
  successRowValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    textAlign: 'right',
  },
  doneBtn: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  doneBtnGrad: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  doneBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },
});
