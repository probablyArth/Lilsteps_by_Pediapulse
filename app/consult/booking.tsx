/**
 * Book Consultation — Doctor Listing Screen
 * Reference: screens/book-consultation/
 *
 * Flow: booking → describe → slots → confirm → payment
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

// ─── Static doctor data ────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: 'dr-madhav',
    name: 'Dr. Madhav Sharma',
    role: 'Senior Pediatrician',
    specialty: 'General Pediatrics · Child Wellness',
    experience: '14 years exp.',
    rating: 4.9,
    tags: ['Newborn Care', 'Fever & Infections'],
    color: AppColors.primary,
  },
  {
    id: 'dr-shilpa',
    name: 'Dr. Shilpa Rao',
    role: 'Nutritionist',
    specialty: 'Pediatric Nutrition & Allergy',
    experience: '9 years exp.',
    rating: 4.8,
    tags: ['Food Allergy', 'Weight Management'],
    color: AppColors.secondary,
  },
  {
    id: 'dr-amit',
    name: 'Dr. Amit Verma',
    role: 'Growth Specialist',
    specialty: 'Child Growth & Development',
    experience: '11 years exp.',
    rating: 4.7,
    tags: ['Growth Delays', 'Developmental Milestones'],
    color: AppColors.accentBlue,
  },
  {
    id: 'dr-harsh',
    name: 'Dr. Harsh Vardhan',
    role: 'Sleep Consultant',
    specialty: 'Sleep Hygiene & Behavioral Health',
    experience: '16 years exp.',
    rating: 5.0,
    tags: ['Sleep Training', 'Night Terrors'],
    color: AppColors.tertiary,
  },
];

// ─── Specialty categories ──────────────────────────────────────────────────────
const SPECIALTIES = [
  { label: 'General', icon: 'medkit-outline', color: AppColors.primary },
  { label: 'Nutrition', icon: 'nutrition-outline', color: AppColors.secondary },
  { label: 'Growth', icon: 'trending-up-outline', color: AppColors.accentBlue },
  { label: 'Sleep', icon: 'moon-outline', color: AppColors.tertiary },
] as const;

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);

  const filtered = DOCTORS.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q));
    const matchesSpecialty =
      !activeSpecialty || d.role.toLowerCase().includes(activeSpecialty.toLowerCase()) ||
      d.specialty.toLowerCase().includes(activeSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  function bookDoctor(doctorId: string) {
    router.push(`/consult/describe?doctorId=${doctorId}`);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Consultations</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={AppColors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pediatricians..."
            placeholderTextColor={AppColors.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={AppColors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>

        {/* Specialty categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Specialty Categories</Text>
          <Pressable onPress={() => setActiveSpecialty(null)}>
            <Text style={styles.sectionLink}>
              {activeSpecialty ? 'Clear' : 'View all'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.specialtyGrid}>
          {SPECIALTIES.map((s) => {
            const isActive = activeSpecialty === s.label;
            return (
              <Pressable
                key={s.label}
                style={[styles.specialtyCard, isActive && { borderColor: s.color, borderWidth: 1.5 }]}
                onPress={() => setActiveSpecialty(isActive ? null : s.label)}
              >
                <View style={[styles.specialtyIconWrap, { backgroundColor: `${s.color}18` }]}>
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                </View>
                <Text style={[styles.specialtyLabel, isActive && { color: s.color }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Doctor list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Pediatricians</Text>
          <Text style={styles.docCount}>{filtered.length} doctors</Text>
        </View>
        <View style={styles.doctorList}>
          {filtered.map((doc) => (
            <DoctorCard key={doc.id} doc={doc} onBook={() => bookDoctor(doc.id)} />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={36} color={AppColors.outlineVariant} />
              <Text style={styles.emptyText}>No doctors found for "{search}"</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Doctor card ───────────────────────────────────────────────────────────────
function DoctorCard({
  doc,
  onBook,
}: {
  doc: typeof DOCTORS[0];
  onBook: () => void;
}) {
  return (
    <View style={styles.doctorCard}>
      {/* Avatar + rating */}
      <View style={styles.docAvatarWrap}>
        <LinearGradient
          colors={[`${doc.color}30`, `${doc.color}15`]}
          style={styles.docAvatar}
        >
          <Text style={[styles.docAvatarInitial, { color: doc.color }]}>
            {doc.name.split(' ')[1]?.charAt(0) ?? doc.name.charAt(0)}
          </Text>
        </LinearGradient>
        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={AppColors.starGold} />
          <Text style={styles.ratingText}>{doc.rating}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.docInfo}>
        <Text style={[styles.docRole, { color: doc.color }]}>{doc.role.toUpperCase()}</Text>
        <Text style={styles.docName}>{doc.name}</Text>
        <Text style={styles.docSpec}>{doc.specialty} · {doc.experience}</Text>

        {/* Tags */}
        <View style={styles.tagRow}>
          {doc.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.docActions}>
          <Pressable
            style={({ pressed }) => [styles.bookBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={onBook}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bookBtnGrad}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.chatBtn}>
            <Ionicons name="chatbubble-outline" size={15} color={AppColors.onSurface} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onSurface, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppColors.surfaceContainerLow, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  searchInput: {
    flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurface,
  },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onSurface, letterSpacing: -0.3 },
  sectionLink: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.primary },
  docCount: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },

  // Specialty grid
  specialtyGrid: { flexDirection: 'row', gap: 12 },
  specialtyCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 8,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  specialtyIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  specialtyLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.onSurface },

  // Doctor list
  doctorList: { gap: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurfaceVariant, textAlign: 'center' },

  // Doctor card
  doctorCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 18,
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
  },
  docAvatarWrap: { alignItems: 'center', position: 'relative' },
  docAvatar: {
    width: 72, height: 72, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  docAvatarInitial: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28 },
  ratingBadge: {
    position: 'absolute', bottom: -8, right: -8,
    backgroundColor: AppColors.surfaceContainerLowest, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 2,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  ratingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.onSurface },

  docInfo: { flex: 1, gap: 4 },
  docRole: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 0.8 },
  docName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, color: AppColors.onSurface, letterSpacing: -0.2 },
  docSpec: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, lineHeight: 18 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { backgroundColor: AppColors.surfaceContainer, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: AppColors.onSurfaceVariant },

  docActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  bookBtn: { borderRadius: 999, overflow: 'hidden', flex: 1 },
  bookBtnGrad: { paddingVertical: 12, alignItems: 'center' },
  bookBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onPrimary },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: AppColors.surfaceContainerHigh, borderRadius: 999,
  },
  chatBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
});
