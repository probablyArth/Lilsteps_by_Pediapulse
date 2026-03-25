import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useConsultations } from '@/hooks/useConsultations';

export default function ConsultDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child } = useChild();
  const { consultations, loading } = useConsultations(child?.id ?? null);

  const consult = consultations.find((c) => c.id === id);

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!consult) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Consultation</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Consultation not found.</Text>
        </View>
      </View>
    );
  }

  const { ai_summary: aiSummary, prescription } = consult;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Visit Summary</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={13} color={AppColors.onSurfaceVariant} />
            <Text style={styles.metaText}>
              {new Date(consult.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="person-outline" size={13} color={AppColors.onSurfaceVariant} />
            <Text style={styles.metaText}>{consult.doctor_name}</Text>
          </View>
        </View>

        {/* AI Summary card */}
        {aiSummary && (
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.summaryHeader}
            >
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={styles.summaryHeaderText}>AI Pre-visit Summary</Text>
            </LinearGradient>

            <View style={styles.summaryBody}>
              <Text style={styles.complaintLabel}>Chief Complaint</Text>
              <Text style={styles.complaintValue}>{aiSummary.chiefComplaint}</Text>

              <View style={styles.detailsBlock}>
                {aiSummary.details.map((d) => (
                  <View key={d.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{d.label}</Text>
                    <Text style={styles.detailValue}>{d.value}</Text>
                  </View>
                ))}
              </View>

              {aiSummary.relevantHistory && (
                <View style={styles.historyNote}>
                  <Ionicons name="time-outline" size={14} color={AppColors.primary} />
                  <Text style={styles.historyNoteText}>{aiSummary.relevantHistory}</Text>
                </View>
              )}

              {aiSummary.allergyNote && (
                <View style={styles.allergyNote}>
                  <Ionicons name="warning-outline" size={14} color="#d97706" />
                  <Text style={styles.allergyNoteText}>{aiSummary.allergyNote}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Doctor outcome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor&apos;s Notes</Text>
          <View style={styles.outcomeCard}>
            <Ionicons name="document-text-outline" size={18} color={AppColors.onSurfaceVariant} />
            <Text style={styles.outcomeText}>{consult.outcome ?? 'No notes recorded'}</Text>
          </View>
        </View>

        {/* Prescription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescription</Text>
          {prescription ? (
            <View style={styles.rxCard}>
              <View style={styles.rxIcon}>
                <Text style={styles.rxLabel}>Rx</Text>
              </View>
              <Text style={styles.rxText}>{prescription}</Text>
            </View>
          ) : (
            <View style={styles.rxNone}>
              <Text style={styles.rxNoneText}>No prescription issued</Text>
            </View>
          )}
        </View>

        {/* Book follow-up */}
        <Pressable
          style={({ pressed }) => [styles.followUpBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push('/consult/booking')}
        >
          <Ionicons name="calendar-outline" size={16} color={AppColors.primary} />
          <Text style={styles.followUpText}>Book Follow-up</Text>
        </Pressable>
      </ScrollView>
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15, color: AppColors.onSurfaceVariant },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },

  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${AppColors.outlineVariant}18`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  metaText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },

  summaryCard: {
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 14 },
  summaryHeaderText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#fff' },
  summaryBody: { padding: 18, gap: 14 },

  complaintLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  complaintValue: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onSurface, marginTop: 2, letterSpacing: -0.3 },

  detailsBlock: { gap: 0, borderRadius: 12, overflow: 'hidden', backgroundColor: `${AppColors.surfaceContainerHigh}40` },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  detailLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant, flex: 1 },
  detailValue: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurface, flex: 2, textAlign: 'right' },

  historyNote: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: `${AppColors.primary}08`, borderRadius: 10, padding: 12,
  },
  historyNoteText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurface, flex: 1, lineHeight: 18 },

  allergyNote: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#fef3c710', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  allergyNoteText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#92400e', flex: 1, lineHeight: 18 },

  section: { gap: 10 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },

  outcomeCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, padding: 16,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  outcomeText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurface, flex: 1, lineHeight: 20 },

  rxCard: {
    flexDirection: 'row', gap: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, padding: 16,
    borderLeftWidth: 3, borderLeftColor: AppColors.primary,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  rxIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${AppColors.primary}12`, alignItems: 'center', justifyContent: 'center',
  },
  rxLabel: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14, color: AppColors.primary },
  rxText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurface, flex: 1, lineHeight: 20 },

  rxNone: {
    backgroundColor: `${AppColors.surfaceContainerHigh}60`, borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  rxNoneText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },

  followUpBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: `${AppColors.primary}40`, borderRadius: 999,
    paddingVertical: 14,
  },
  followUpText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.primary },
});
