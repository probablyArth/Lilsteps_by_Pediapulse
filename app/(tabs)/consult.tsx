import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Card } from 'heroui-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TabScreenLayout } from '@/components/TabScreenLayout';
import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { useConsultations } from '@/hooks/useConsultations';

export default function ConsultScreen() {
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

  const headerContent = (
    <>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>LilSteps AI</Text>
        <Text style={styles.headerSub}>Your pediatric assistant</Text>
      </View>
      <Pressable style={styles.addBtn} onPress={() => router.push('/consult/booking')}>
        <Ionicons name="add" size={20} color={AppColors.primary} />
      </Pressable>
    </>
  );

  return (
    <TabScreenLayout headerContent={headerContent}>
      <Card style={styles.aiHeroCard}>
        <Card.Body style={styles.aiHeroBody}>
          <LinearGradient
            colors={[`${AppColors.primary}08`, `${AppColors.primary}02`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.aiIconWrap}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiIconGrad}
            >
              <Ionicons name="sparkles" size={24} color={AppColors.onPrimary} />
            </LinearGradient>
          </View>
          <View style={styles.aiHeroText}>
            <Text style={styles.aiHeroTitle}>AI Health Check-in</Text>
            <Text style={styles.aiHeroDesc}>
              Answer a few questions and get personalized health insights for your child
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.startCheckinBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push('/checkin')}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startCheckinGrad}
            >
              <Text style={styles.startCheckinText}>Start Check-in</Text>
              <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
            </LinearGradient>
          </Pressable>
        </Card.Body>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {nextAppointment && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          )}
        </View>
        {loadingAppts ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={AppColors.primary} />
          </View>
        ) : nextAppointment ? (
          <Card style={styles.appointmentCard}>
            <Card.Body style={styles.appointmentBody}>
              <View style={styles.apptAccent} />
              <View style={styles.apptTop}>
                <View style={styles.apptAvatar}>
                  <Text style={styles.apptAvatarText}>
                    {(nextAppointment.doctors?.name ?? 'D').split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptDoctor}>{nextAppointment.doctors?.name ?? 'Doctor'}</Text>
                  <Text style={styles.apptSpec}>{nextAppointment.doctors?.specialisation ?? ''}</Text>
                </View>
                <View style={styles.apptDateBadge}>
                  <Text style={styles.apptDateDay}>
                    {new Date(nextAppointment.date).getDate()}
                  </Text>
                  <Text style={styles.apptDateMonth}>
                    {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
              </View>
              <View style={styles.apptDetails}>
                <View style={styles.apptMeta}>
                  <Ionicons name="time-outline" size={14} color={AppColors.onSurfaceVariant} />
                  <Text style={styles.apptMetaText}>{nextAppointment.time}</Text>
                </View>
                <View style={styles.apptMeta}>
                  <Ionicons name="location-outline" size={14} color={AppColors.onSurfaceVariant} />
                  <Text style={styles.apptMetaText}>{nextAppointment.doctors?.hospital ?? ''}</Text>
                </View>
              </View>
              <View style={styles.apptActions}>
                <Pressable 
                  style={({ pressed }) => [styles.viewSummaryBtn, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text style={styles.viewSummaryText}>View Details</Text>
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.8 : 1 }]} 
                  onPress={() => handleCancel(nextAppointment.id)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </Card.Body>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Body style={styles.emptyCardBody}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={28} color={AppColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyBody}>Book one after completing a health check-in</Text>
            </Card.Body>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Doctors</Text>
        {loadingDocs ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={AppColors.primary} />
          </View>
        ) : doctors.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Body style={styles.emptyCardBody}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={28} color={AppColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No doctors yet</Text>
              <Text style={styles.emptyBody}>Your pediatricians will appear here</Text>
            </Card.Body>
          </Card>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.doctorsRow}
            style={styles.doctorsScroll}
          >
            {doctors.map((doc) => (
              <Card key={doc.id} style={styles.doctorCard}>
                <Card.Body style={styles.doctorCardBody}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>{doc.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.doctorName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.doctorSpec}>{doc.specialisation}</Text>
                  <Text style={styles.doctorHospital} numberOfLines={2}>{doc.hospital}</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.bookPill, 
                      !doc.is_available && styles.bookPillDisabled, 
                      { opacity: pressed ? 0.75 : 1 }
                    ]}
                    onPress={() => doc.is_available && router.push('/consult/booking')}
                  >
                    <Text style={[styles.bookPillText, !doc.is_available && styles.bookPillTextDisabled]}>
                      {doc.is_available ? 'Book' : 'Unavailable'}
                    </Text>
                  </Pressable>
                </Card.Body>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consultation History</Text>
        {loadingConsult ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={AppColors.primary} />
          </View>
        ) : consultations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Body style={styles.emptyCardBody}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="document-text-outline" size={28} color={AppColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No past consultations</Text>
              <Text style={styles.emptyBody}>Your visit history will appear here</Text>
            </Card.Body>
          </Card>
        ) : (
          <View style={styles.historyList}>
            {consultations.map((c) => (
              <Pressable
                key={c.id}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/consult/${c.id}`)}
              >
                <Card style={styles.historyCard}>
                  <Card.Body style={styles.historyCardBody}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyDateBadge}>
                        <Text style={styles.historyDateDay}>
                          {new Date(c.created_at).getDate()}
                        </Text>
                        <Text style={styles.historyDateMonth}>
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyComplaint}>{c.chief_complaint ?? 'Consultation'}</Text>
                        <Text style={styles.historyOutcome} numberOfLines={1}>{c.outcome ?? ''}</Text>
                        <View style={styles.historyDoctorRow}>
                          <Ionicons name="person-outline" size={12} color={AppColors.primary} />
                          <Text style={styles.historyDoctor}>{c.doctor_name}</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={AppColors.outlineVariant} />
                  </Card.Body>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerLeft: { gap: 2 },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22,
    color: AppColors.onSurface, letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },

  aiHeroCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiHeroBody: {
    padding: 20,
    gap: 16,
  },
  aiIconWrap: {
    alignSelf: 'flex-start',
  },
  aiIconGrad: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  aiHeroText: { gap: 6 },
  aiHeroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20,
    color: AppColors.onSurface, letterSpacing: -0.3,
  },
  aiHeroDesc: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurfaceVariant, lineHeight: 20,
  },
  startCheckinBtn: {
    borderRadius: 999, overflow: 'hidden', alignSelf: 'flex-start',
  },
  startCheckinGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  startCheckinText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onPrimary,
  },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17,
    color: AppColors.onSurface, letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: AppColors.primary, borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: AppColors.onPrimary,
  },

  loadingRow: { paddingVertical: 20, alignItems: 'center' },

  appointmentCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
  },
  appointmentBody: {
    padding: 16,
    gap: 14,
  },
  apptAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: AppColors.primary, borderRadius: 2,
  },
  apptTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apptAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${AppColors.primaryContainer}50`,
    alignItems: 'center', justifyContent: 'center',
  },
  apptAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.primary },
  apptInfo: { flex: 1, gap: 2 },
  apptDoctor: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  apptSpec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },
  apptDateBadge: {
    backgroundColor: `${AppColors.primary}10`, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
  },
  apptDateDay: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.primary },
  apptDateMonth: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: AppColors.primary },
  apptDetails: { flexDirection: 'row', gap: 16 },
  apptMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  apptMetaText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },
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

  emptyCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}20`,
  },
  emptyCardBody: {
    padding: 24,
    alignItems: 'center', gap: 8,
  },
  emptyIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  emptyBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurfaceVariant, textAlign: 'center' },

  doctorsScroll: { marginHorizontal: -20 },
  doctorsRow: { gap: 10, paddingHorizontal: 20 },
  doctorCard: {
    width: 140,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
  },
  doctorCardBody: {
    padding: 14, gap: 6, alignItems: 'center',
  },
  doctorAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: `${AppColors.primaryContainer}50`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  doctorAvatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: AppColors.primary },
  doctorName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'center' },
  doctorSpec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.primary, textAlign: 'center' },
  doctorHospital: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant, textAlign: 'center' },
  bookPill: {
    marginTop: 6, backgroundColor: AppColors.primary, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 8, alignSelf: 'stretch', alignItems: 'center',
  },
  bookPillDisabled: { backgroundColor: AppColors.surfaceContainerHigh },
  bookPillText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.onPrimary },
  bookPillTextDisabled: { color: AppColors.onSurfaceVariant },

  historyList: { gap: 10 },
  historyCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 14,
  },
  historyCardBody: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  historyDateBadge: {
    backgroundColor: `${AppColors.primary}08`, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 44,
  },
  historyDateDay: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: AppColors.primary },
  historyDateMonth: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: AppColors.primary },
  historyInfo: { flex: 1, gap: 3 },
  historyComplaint: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  historyOutcome: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  historyDoctorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyDoctor: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },
});
