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

type Step = 1 | 2 | 3 | 4 | 'success';

function getNextDays(n: number) {
  const days = [];
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : labels[d.getDay()],
      sub: `${d.getDate()} ${months[d.getMonth()]}`,
      isoDate: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useChild();
  const { doctors, loading: loadingDocs } = useDoctors();
  const { bookAppointment } = useAppointments(child?.id ?? null);

  const [step, setStep] = useState<Step>(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const days = getNextDays(7);

  // Auto-select first doctor
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) ?? doctors[0];

  // Fetch time slots for selected doctor + date
  const { slots, loading: loadingSlots } = useTimeSlots(
    selectedDoctorId,
    days[selectedDay].isoDate
  );

  // Reset slot when doctor or day changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDoctorId, selectedDay]);

  function canNext() {
    if (step === 1) return selectedDoctorId !== null;
    if (step === 2) return true;
    if (step === 3) return selectedSlot !== null;
    return false;
  }

  async function next() {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) {
      if (!child || !selectedDoctor || !selectedSlot) return;
      setBooking(true);
      try {
        await bookAppointment({
          child_id: child.id,
          doctor_id: selectedDoctor.id,
          date: days[selectedDay].isoDate,
          time: selectedSlot,
        });
        setStep('success');
      } catch {
        // booking error
      } finally {
        setBooking(false);
      }
    }
  }

  const childName = child?.name ?? 'Child';

  if (step === 'success') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Appointment Confirmed!</Text>
          <View style={styles.successCard}>
            <Row icon="person-outline" label="Doctor" value={selectedDoctor?.name ?? ''} />
            <Row icon="business-outline" label="Hospital" value={selectedDoctor?.hospital ?? ''} />
            <Row icon="calendar-outline" label="Date" value={days[selectedDay].label === 'Today' || days[selectedDay].label === 'Tomorrow' ? days[selectedDay].label : `${days[selectedDay].label}, ${days[selectedDay].sub}`} />
            <Row icon="time-outline" label="Time" value={selectedSlot ?? ''} />
          </View>
          <Pressable style={styles.calBtn}>
            <Ionicons name="calendar-outline" size={16} color={AppColors.primary} />
            <Text style={styles.calBtnText}>Add to Calendar</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.85 : 1 }]} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => (step === 1 ? router.back() : setStep((step - 1) as Step))}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, (step as number) >= s && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>

        {/* Step 1 — Doctor */}
        {step === 1 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Choose a doctor</Text>
            {loadingDocs ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : (
              doctors.filter((d) => d.is_available).map((doc) => (
                <Pressable key={doc.id} style={[styles.doctorRow, selectedDoctorId === doc.id && styles.doctorRowSelected]}
                  onPress={() => setSelectedDoctorId(doc.id)}>
                  <View style={styles.docAvatar}><Text style={styles.docAvatarText}>{doc.name.charAt(0)}</Text></View>
                  <View style={styles.docInfo}>
                    <Text style={styles.docName}>{doc.name}</Text>
                    <Text style={styles.docSpec}>{doc.specialisation}</Text>
                    <Text style={styles.docHosp}>{doc.hospital}</Text>
                  </View>
                  {selectedDoctorId === doc.id && <Ionicons name="checkmark-circle" size={22} color={AppColors.primary} />}
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Step 2 — Date */}
        {step === 2 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Pick a date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
              {days.map((d, i) => (
                <Pressable key={i} style={[styles.dayChip, selectedDay === i && styles.dayChipActive]} onPress={() => setSelectedDay(i)}>
                  <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d.label}</Text>
                  <Text style={[styles.dayDate, selectedDay === i && styles.dayDateActive]}>{d.sub}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Step 3 — Time */}
        {step === 3 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Choose a time</Text>
            {loadingSlots ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : slots.length === 0 ? (
              <Text style={styles.noSlotsText}>No available slots for this date. Try another date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => (
                  <Pressable
                    key={slot.id}
                    disabled={!slot.is_available}
                    style={[styles.slotChip, !slot.is_available && styles.slotDisabled, selectedSlot === slot.time && styles.slotSelected]}
                    onPress={() => setSelectedSlot(slot.time)}
                  >
                    <Text style={[styles.slotText, !slot.is_available && styles.slotTextDisabled, selectedSlot === slot.time && styles.slotTextSelected]}>
                      {slot.time}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 4 — Confirm */}
        {step === 4 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Confirm booking</Text>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmFor}>Booking for {childName}</Text>
              <Row icon="person-outline" label="Doctor" value={selectedDoctor?.name ?? ''} />
              <Row icon="medical-outline" label="Specialisation" value={selectedDoctor?.specialisation ?? ''} />
              <Row icon="business-outline" label="Hospital" value={selectedDoctor?.hospital ?? ''} />
              <Row icon="calendar-outline" label="Date" value={`${days[selectedDay].label}, ${days[selectedDay].sub}`} />
              <Row icon="time-outline" label="Time" value={selectedSlot ?? ''} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={({ pressed }) => [styles.nextBtn, !canNext() && styles.nextBtnDisabled, { opacity: pressed ? 0.88 : 1 }]}
          disabled={!canNext() || booking} onPress={next}>
          <LinearGradient colors={[AppColors.primary, '#8b3cf7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextBtnGrad}>
            {booking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>{step === 4 ? 'Confirm Booking' : 'Continue'}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Ionicons name={icon as any} size={16} color={AppColors.onSurfaceVariant} />
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20` },
  label: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant, flex: 1 },
  value: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'right', flex: 2 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },
  stepRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingBottom: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: `${AppColors.outlineVariant}40` },
  stepDotActive: { backgroundColor: AppColors.primary },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  stepSection: { gap: 16 },
  stepTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: AppColors.onSurface, letterSpacing: -0.5 },
  noSlotsText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurfaceVariant, textAlign: 'center', paddingVertical: 20 },

  doctorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: 'transparent',
  },
  doctorRowSelected: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}06` },
  docAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${AppColors.primaryContainer}50`, alignItems: 'center', justifyContent: 'center' },
  docAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.primary },
  docInfo: { flex: 1, gap: 2 },
  docName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  docSpec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },
  docHosp: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },

  dateRow: { gap: 10 },
  dayChip: { alignItems: 'center', gap: 4, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: 'transparent', minWidth: 80 },
  dayChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  dayLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  dayLabelActive: { color: '#fff' },
  dayDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
  dayDateActive: { color: 'rgba(255,255,255,0.8)' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30` },
  slotDisabled: { backgroundColor: `${AppColors.surfaceContainerHigh}80`, borderColor: 'transparent' },
  slotSelected: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  slotText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  slotTextDisabled: { color: `${AppColors.onSurfaceVariant}50` },
  slotTextSelected: { color: '#fff' },

  confirmCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 18, gap: 2, shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  confirmFor: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary, marginBottom: 8 },

  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20` },
  nextBtn: { borderRadius: 999, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  nextBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#bbf7d0' },
  successTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: AppColors.onSurface, textAlign: 'center' },
  successCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 18, gap: 2 },
  calBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, borderWidth: 1.5, borderColor: `${AppColors.primary}40` },
  calBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.primary },
  doneBtn: { width: '100%', backgroundColor: AppColors.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
});
