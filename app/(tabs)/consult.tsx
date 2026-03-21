import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';
import { useChild } from '@/context/child';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { useConsultations } from '@/hooks/useConsultations';

export default function ConsultScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useChild();
  const { doctors, loading: loadingDocs } = useDoctors();
  const { upcoming, cancelAppointment, loading: loadingAppts } = useAppointments(child?.id ?? null);
  const { consultations, loading: loadingConsult } = useConsultations(child?.id ?? null);

  const nextAppointment = upcoming[0] ?? null;

  async function handleCancel(id: string) {
    try {
      await cancelAppointment(id);
    } catch {
      // error handled
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consultations</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/consult/booking')}>
          <Ionicons name="add" size={20} color={AppColors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 110 + insets.bottom }]} showsVerticalScrollIndicator={false}>

        {/* Upcoming appointment */}
        <View style={styles.section}>
          <Text style={[typography.headingMD, styles.sectionTitle]}>Upcoming</Text>
          {loadingAppts ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : nextAppointment ? (
            <View style={styles.appointmentCard}>
              <View style={styles.apptTop}>
                <View style={styles.apptAvatar}>
                  <Text style={styles.apptAvatarText}>
                    {(nextAppointment.doctors?.name ?? 'D').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptDoctor}>{nextAppointment.doctors?.name ?? 'Doctor'}</Text>
                  <Text style={styles.apptSpec}>{nextAppointment.doctors?.specialisation ?? ''}</Text>
                  <View style={styles.apptMeta}>
                    <Ionicons name="calendar-outline" size={12} color={AppColors.onSurfaceVariant} />
                    <Text style={styles.apptMetaText}>
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {nextAppointment.time}
                    </Text>
                  </View>
                  <View style={styles.apptMeta}>
                    <Ionicons name="location-outline" size={12} color={AppColors.onSurfaceVariant} />
                    <Text style={styles.apptMetaText}>{nextAppointment.doctors?.hospital ?? ''}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.apptActions}>
                <Pressable style={styles.viewSummaryBtn}>
                  <Text style={styles.viewSummaryText}>View Summary</Text>
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={() => handleCancel(nextAppointment.id)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={AppColors.outlineVariant} />
              <Text style={styles.emptyTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyBody}>Book one after completing a health check-in.</Text>
              <Pressable style={styles.emptyBtn} onPress={() => router.push('/checkin')}>
                <Text style={styles.emptyBtnText}>Start Check-in</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Doctors */}
        <View style={styles.section}>
          <Text style={[typography.headingMD, styles.sectionTitle]}>Your Doctors</Text>
          {loadingDocs ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.doctorsRow}>
              {doctors.map((doc) => (
                <View key={doc.id} style={styles.doctorCard}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>{doc.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.doctorName}>{doc.name}</Text>
                  <Text style={styles.doctorSpec}>{doc.specialisation}</Text>
                  <Text style={styles.doctorHospital} numberOfLines={2}>{doc.hospital}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.bookPill, !doc.is_available && styles.bookPillDisabled, { opacity: pressed ? 0.75 : 1 }]}
                    onPress={() => doc.is_available && router.push('/consult/booking')}
                  >
                    <Text style={[styles.bookPillText, !doc.is_available && styles.bookPillTextDisabled]}>
                      {doc.is_available ? 'Book' : 'Unavailable'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={[typography.headingMD, styles.sectionTitle]}>Consultation History</Text>
          {loadingConsult ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : consultations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No past consultations yet</Text>
              <Text style={styles.emptyBody}>Your visit history will appear here.</Text>
            </View>
          ) : (
            consultations.map((c) => (
              <Pressable
                key={c.id}
                style={({ pressed }) => [styles.historyCard, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/consult/${c.id}`)}
              >
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={styles.historyComplaint}>{c.chief_complaint ?? 'Consultation'}</Text>
                  <Text style={styles.historyOutcome} numberOfLines={1}>{c.outcome ?? ''}</Text>
                  <Text style={styles.historyDoctor}>{c.doctor_name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={`${AppColors.onSurfaceVariant}60`} />
              </Pressable>
            ))
          )}
        </View>

        {/* Book CTA */}
        {!nextAppointment && (
          <Pressable
            style={({ pressed }) => [styles.bookCta, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.push('/consult/booking')}
          >
            <Text style={styles.bookCtaText}>Book a Consultation</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: AppColors.onSurface, letterSpacing: -0.5 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 28 },
  section: { gap: 14 },
  sectionTitle: {},

  // Appointment card
  appointmentCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    gap: 14, borderLeftWidth: 3, borderLeftColor: AppColors.primary,
  },
  apptTop: { flexDirection: 'row', gap: 14 },
  apptAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: `${AppColors.primaryContainer}50`, alignItems: 'center', justifyContent: 'center',
  },
  apptAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.primary },
  apptInfo: { flex: 1, gap: 3 },
  apptDoctor: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  apptSpec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },
  apptMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  apptMetaText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  apptActions: { flexDirection: 'row', gap: 10 },
  viewSummaryBtn: {
    flex: 1, backgroundColor: `${AppColors.primary}10`, borderRadius: 999,
    paddingVertical: 10, alignItems: 'center',
  },
  viewSummaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary },
  cancelBtn: {
    flex: 1, backgroundColor: AppColors.surfaceContainerHigh, borderRadius: 999,
    paddingVertical: 10, alignItems: 'center',
  },
  cancelText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurfaceVariant },

  // Empty state
  emptyCard: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: `${AppColors.outlineVariant}50`,
    borderRadius: 16, padding: 28, alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  emptyBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurfaceVariant, textAlign: 'center' },
  emptyBtn: {
    marginTop: 4, backgroundColor: `${AppColors.primary}10`, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary },

  // Doctors
  doctorsRow: { gap: 12, paddingRight: 4 },
  doctorCard: {
    width: 148, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    padding: 16, gap: 6, alignItems: 'center',
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  doctorAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: `${AppColors.primaryContainer}50`, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  doctorAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: AppColors.primary },
  doctorName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'center' },
  doctorSpec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.primary, textAlign: 'center' },
  doctorHospital: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant, textAlign: 'center' },
  bookPill: {
    marginTop: 4, backgroundColor: AppColors.primary, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 8, alignSelf: 'stretch', alignItems: 'center',
  },
  bookPillDisabled: { backgroundColor: AppColors.surfaceContainerHigh },
  bookPillText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#fff' },
  bookPillTextDisabled: { color: AppColors.onSurfaceVariant },

  // History
  historyCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 14, padding: 16,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  historyLeft: { flex: 1, gap: 3 },
  historyDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.outlineVariant },
  historyComplaint: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  historyOutcome: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  historyDoctor: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },

  bookCta: {
    backgroundColor: AppColors.primary, borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  bookCtaText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
});
