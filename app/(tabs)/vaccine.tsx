import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useVaccinations, type VaccinationRow } from '@/hooks/useVaccinations';

// Human-readable bracket label
const BRACKET_LABEL: Record<string, string> = {
  NEWBORN: 'Newborn (0–3 months)',
  EARLY_INFANT: 'Early Infant (3–6 months)',
  INFANT: 'Infant (6–12 months)',
  TODDLER_EARLY: 'Toddler Early (12–18 months)',
  TODDLER: 'Toddler (18 months – 3 years)',
  PRESCHOOL: 'Preschool (3–5 years)',
  SCHOOL_EARLY: 'School Early (5–8 years)',
  SCHOOL_MID: 'School Mid (8–12 years)',
  ADOLESCENT: 'Adolescent (12+ years)',
};

export default function VaccineScreen() {
  const insets = useSafeAreaInsets();
  const { bracket, child } = useChild();
  const { vaccinations, loading, markDone } = useVaccinations(child?.id ?? null);

  const bracketLabel = BRACKET_LABEL[bracket ?? ''] ?? bracket ?? '';

  const doneCount = vaccinations.filter((v) => v.status === 'done').length;
  const total = vaccinations.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const nextDue = vaccinations.find((v) => v.status === 'due_soon');
  const nextUpcoming = vaccinations.find((v) => v.status === 'upcoming');

  async function handleMarkGiven(id: string) {
    try {
      await markDone(id);
    } catch {
      // error handled in hook
    }
  }

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vaccination</Text>
        <Pressable style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={22} color={AppColors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero progress section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.bracketLabel}>{bracketLabel}</Text>
              <Text style={styles.heroTitle}>Vaccination Progress</Text>
            </View>
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressBadge}
            >
              <Text style={styles.progressBadgeCount}>{doneCount}/{total}</Text>
              <Text style={styles.progressBadgeLabel}>Given</Text>
            </LinearGradient>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressPct}%` }]}
            />
          </View>
          <Text style={styles.progressSubtext}>{progressPct}% complete · {total - doneCount} remaining</Text>
        </View>

        {/* Upload certificate */}
        <Pressable style={({ pressed }) => [styles.uploadCard, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={26} color={AppColors.primary} />
          </View>
          <View style={styles.uploadText}>
            <Text style={styles.uploadTitle}>Upload Vaccination Certificate</Text>
            <Text style={styles.uploadSub}>Keep your records digital and safe</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={`${AppColors.onSurfaceVariant}60`} />
        </Pressable>

        {/* Bento stats */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <Ionicons name="calendar-outline" size={26} color={AppColors.primary} />
            <View style={styles.bentoText}>
              <Text style={styles.bentoLabel}>Next Dose</Text>
              <Text style={styles.bentoValue} numberOfLines={2}>
                {nextDue?.vaccine_name ?? nextUpcoming?.vaccine_name ?? 'All done!'}
              </Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <Ionicons name="warning-outline" size={26} color={AppColors.tertiary} />
            <View style={styles.bentoText}>
              <Text style={styles.bentoLabel}>Upcoming</Text>
              <Text style={[styles.bentoValue, { color: nextDue ? AppColors.tertiary : AppColors.onSurface }]}>
                {nextDue ? 'Due Soon' : nextUpcoming ? new Date(nextUpcoming.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vaccination list */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Schedule</Text>
          <View style={styles.list}>
            {vaccinations.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                onMarkGiven={() => handleMarkGiven(vaccine.id)}
              />
            ))}
          </View>
        </View>

        {/* Doctor's note */}
        <View style={styles.doctorNote}>
          <Ionicons name="information-circle-outline" size={20} color={AppColors.tertiary} />
          <View style={styles.doctorNoteText}>
            <Text style={styles.doctorNoteTitle}>Doctor&apos;s Note</Text>
            <Text style={styles.doctorNoteBody}>
              Minor fever after DTP/Pentavalent is common. Apply a cold compress on the injection site if swelling occurs. Contact your pediatrician if fever exceeds 101°F.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function VaccineCard({
  vaccine,
  onMarkGiven,
}: {
  vaccine: VaccinationRow;
  onMarkGiven: () => void;
}) {
  const { status, vaccine_name: name, dose_label } = vaccine;
  const dateStr = new Date(vaccine.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const displayName = dose_label ? `${name} (${dose_label})` : name;

  if (status === 'done') {
    const givenStr = vaccine.administered_date
      ? new Date(vaccine.administered_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    return (
      <View style={styles.cardDone}>
        <View style={styles.cardLeft}>
          <View style={styles.iconDone}>
            <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{displayName}</Text>
            <Text style={styles.cardDate}>{dateStr}{givenStr ? ` · Given ${givenStr}` : ''}</Text>
          </View>
        </View>
        <View style={styles.badgeDone}>
          <Text style={styles.badgeDoneText}>Given</Text>
        </View>
      </View>
    );
  }

  if (status === 'due_soon') {
    return (
      <View style={styles.cardDueSoon}>
        <View style={styles.cardDueSoonBlob} />
        <View style={styles.cardDueSoonTop}>
          <View style={styles.cardLeft}>
            <View style={styles.iconDueSoon}>
              <Ionicons name="medical" size={20} color={AppColors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { fontFamily: 'PlusJakartaSans_800ExtraBold' }]}>{displayName}</Text>
              <Text style={styles.cardDate}>{dateStr}</Text>
            </View>
          </View>
          <View style={styles.badgeDueSoon}>
            <Text style={styles.badgeDueSoonText}>Due Now</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [styles.actionPrimary, { opacity: pressed ? 0.88 : 1 }]}
            onPress={onMarkGiven}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionPrimaryGrad}
            >
              <Text style={styles.actionPrimaryText}>Mark as Given</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionSecondary, { opacity: pressed ? 0.75 : 1 }]}>
            <Text style={styles.actionSecondaryText}>Not Sure</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (status === 'overdue') {
    return (
      <View style={styles.cardOverdue}>
        <View style={styles.cardLeft}>
          <View style={styles.iconOverdue}>
            <Ionicons name="calendar-clear-outline" size={20} color="#b91c1c" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{displayName}</Text>
            <Text style={styles.cardDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={styles.badgeOverdue}>
          <Text style={styles.badgeOverdueText}>Overdue</Text>
        </View>
      </View>
    );
  }

  // upcoming
  return (
    <View style={[styles.cardUpcoming]}>
      <View style={styles.cardLeft}>
        <View style={styles.iconUpcoming}>
          <Ionicons name="time-outline" size={20} color={AppColors.onSurfaceVariant} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: `${AppColors.onSurface}90` }]}>{displayName}</Text>
          <Text style={styles.cardDate}>{dateStr}</Text>
        </View>
      </View>
      <View style={styles.badgeUpcoming}>
        <Text style={styles.badgeUpcomingText}>Upcoming</Text>
      </View>
    </View>
  );
}

const CARD_BASE: object = {
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 16,
  padding: 16,
  shadowColor: '#342c38',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: AppColors.onSurface, letterSpacing: -0.5 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },

  // Hero
  heroSection: { gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  bracketLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  heroTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: AppColors.onSurface, letterSpacing: -0.5 },
  progressBadge: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', flexDirection: 'row', gap: 6 },
  progressBadgeCount: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: '#fff' },
  progressBadgeLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  progressTrack: { height: 12, backgroundColor: `${AppColors.surfaceContainerHigh}80`, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 12, borderRadius: 999 },
  progressSubtext: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },

  // Upload
  uploadCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: `${AppColors.primary}35`,
    padding: 16,
  },
  uploadIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadText: { flex: 1, gap: 2 },
  uploadTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  uploadSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },

  // Bento
  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    padding: 16, gap: 12,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  bentoText: { gap: 2 },
  bentoLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6 },
  bentoValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },

  // List
  listSection: { gap: 12 },
  listTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: AppColors.onSurface },
  list: { gap: 10 },

  // Shared card elements
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  cardDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },

  // Done card
  cardDone: {
    ...(CARD_BASE as any),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  iconDone: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
  },
  badgeDone: { backgroundColor: '#f0fdf4', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDoneText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Due soon card
  cardDueSoon: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: `${AppColors.primary}18`,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
    gap: 14, overflow: 'hidden',
  },
  cardDueSoonBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${AppColors.primary}07`,
  },
  cardDueSoonTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconDueSoon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${AppColors.primaryContainer}35`,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDueSoon: { backgroundColor: AppColors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDueSoonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionPrimary: { flex: 1, borderRadius: 999, overflow: 'hidden' },
  actionPrimaryGrad: { paddingVertical: 12, alignItems: 'center' },
  actionPrimaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#fff' },
  actionSecondary: {
    flex: 1, backgroundColor: AppColors.surfaceContainerHighest, borderRadius: 999,
    paddingVertical: 12, alignItems: 'center',
  },
  actionSecondaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurfaceVariant },

  // Overdue card
  cardOverdue: {
    ...(CARD_BASE as any),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderLeftWidth: 3, borderLeftColor: '#ef4444',
  },
  iconOverdue: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center',
  },
  badgeOverdue: { backgroundColor: '#fef2f2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOverdueText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Upcoming card
  cardUpcoming: {
    ...(CARD_BASE as any),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    opacity: 0.72,
  },
  iconUpcoming: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  badgeUpcoming: { backgroundColor: AppColors.surfaceContainerHigh, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeUpcomingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Doctor's note
  doctorNote: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: `${AppColors.tertiaryContainer}20`,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: `${AppColors.tertiary}15`,
  },
  doctorNoteText: { flex: 1, gap: 4 },
  doctorNoteTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  doctorNoteBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, lineHeight: 18 },
});
