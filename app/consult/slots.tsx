/**
 * Select Date & Time — Step 2 of booking
 *
 * Date strip (today + 6 days) + time grid (9am–4pm)
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

// ─── Time slots 9am–4pm ────────────────────────────────────────────────────────
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
];

// Randomly mark a couple as unavailable for demo realism
const UNAVAILABLE_SLOTS = new Set(['11:00 AM', '02:00 PM']);

// ─── Date helpers ──────────────────────────────────────────────────────────────
function getNextDays(n: number) {
  const out = [];
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_LABELS[d.getDay()],
      date: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`,
      dayOfWeek: DAY_LABELS[d.getDay()],
      iso: d.toISOString().split('T')[0],
      fullLabel: i === 0
        ? `Today, ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
        : i === 1
        ? `Tomorrow, ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
        : `${DAY_LABELS[d.getDay()]}, ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`,
    });
  }
  return out;
}

const DAYS = getNextDays(7);

// Doctor name map (same as booking.tsx)
const DOCTOR_NAMES: Record<string, string> = {
  'dr-madhav': 'Dr. Madhav Sharma',
  'dr-shilpa': 'Dr. Shilpa Rao',
  'dr-amit':   'Dr. Amit Verma',
  'dr-harsh':  'Dr. Harsh Vardhan',
};

export default function SlotsScreen() {
  const insets = useSafeAreaInsets();
  const { doctorId, issue } = useLocalSearchParams<{ doctorId: string; issue: string }>();

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const doctorName = DOCTOR_NAMES[doctorId] ?? 'Doctor';

  function goToConfirm() {
    if (!selectedSlot) return;
    router.push(
      `/consult/confirm?doctorId=${doctorId}&dateIso=${DAYS[selectedDay].iso}&dateLabel=${encodeURIComponent(DAYS[selectedDay].fullLabel)}&time=${encodeURIComponent(selectedSlot)}&issue=${encodeURIComponent(issue ?? '')}`
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pick a Slot</Text>
          <Text style={styles.headerSub}>{doctorName}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, s <= 2 && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date strip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStrip}
          >
            {DAYS.map((d, i) => {
              const active = selectedDay === i;
              return (
                <Pressable
                  key={i}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => { setSelectedDay(i); setSelectedSlot(null); }}
                >
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d.label}</Text>
                  <Text style={[styles.dayDate, active && styles.dayDateActive]}>{d.date}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Doctor availability note */}
        <View style={styles.availCard}>
          <View style={styles.availDot} />
          <Text style={styles.availText}>
            {doctorName} is available on {DAYS[selectedDay].fullLabel}
          </Text>
        </View>

        {/* Time grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available times</Text>
          <Text style={styles.sectionSub}>All times are in IST</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const unavailable = UNAVAILABLE_SLOTS.has(slot);
              const active = selectedSlot === slot;
              return (
                <Pressable
                  key={slot}
                  disabled={unavailable}
                  style={[styles.slotChip, unavailable && styles.slotDisabled, active && styles.slotActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  {active && (
                    <LinearGradient
                      colors={[AppColors.primary, AppColors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Ionicons
                    name={unavailable ? 'close-outline' : 'time-outline'}
                    size={14}
                    color={unavailable ? `${AppColors.onSurfaceVariant}50` : active ? AppColors.onPrimary : AppColors.primary}
                  />
                  <Text
                    style={[
                      styles.slotText,
                      unavailable && styles.slotTextDisabled,
                      active && styles.slotTextActive,
                    ]}
                  >
                    {slot}
                  </Text>
                  {unavailable && <Text style={styles.bookedLabel}>Booked</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Consultation info */}
        <View style={styles.infoRow}>
          <InfoChip icon="videocam-outline" label="Video consultation" />
          <InfoChip icon="time-outline" label="30 min session" />
          <InfoChip icon="cash-outline" label="₹400 fee" />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {selectedSlot && (
          <View style={styles.selectedSummary}>
            <Ionicons name="calendar-outline" size={14} color={AppColors.primary} />
            <Text style={styles.selectedSummaryText}>
              {DAYS[selectedDay].fullLabel} · {selectedSlot}
            </Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.continueBtn, !selectedSlot && styles.continueBtnDisabled, { opacity: pressed ? 0.87 : 1 }]}
          disabled={!selectedSlot}
          onPress={goToConfirm}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueBtnGrad}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon as any} size={14} color={AppColors.primary} />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },
  headerSub: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },

  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: `${AppColors.outlineVariant}30` },
  stepDotActive: { backgroundColor: AppColors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },

  section: { gap: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: AppColors.onSurface, letterSpacing: -0.4 },
  sectionSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, marginTop: -8 },

  dateStrip: { gap: 10 },
  dayChip: {
    alignItems: 'center', gap: 4, paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: 'transparent', minWidth: 88,
  },
  dayChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  dayLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  dayLabelActive: { color: AppColors.onPrimary },
  dayDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
  dayDateActive: { color: 'rgba(255,255,255,0.8)' },

  availCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppColors.successGreenSurface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.successGreen },
  availText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.successGreenDark, flex: 1 },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30`,
    overflow: 'hidden', minWidth: '45%',
  },
  slotDisabled: { backgroundColor: `${AppColors.surfaceContainerHigh}80`, borderColor: 'transparent', opacity: 0.55 },
  slotActive: { borderColor: 'transparent', backgroundColor: 'transparent' },
  slotText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface, flex: 1 },
  slotTextDisabled: { color: `${AppColors.onSurfaceVariant}50` },
  slotTextActive: { color: AppColors.onPrimary },
  bookedLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: `${AppColors.onSurfaceVariant}60` },

  infoRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${AppColors.primary}10`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  infoChipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.primary },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}15`,
  },
  selectedSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${AppColors.primary}08`, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  selectedSummaryText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.primary },
  continueBtn: { borderRadius: 999, overflow: 'hidden' },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  continueBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onPrimary },
});
