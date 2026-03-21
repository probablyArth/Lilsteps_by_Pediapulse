import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AllergyBanner } from '@/components/home/AllergyBanner';
import { BRACKET_CONFIG } from '@/constants/bracketConfig';
import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';
import { useChild } from '@/context/child';
import { useDocuments, type DocumentRow } from '@/hooks/useDocuments';

const CATEGORIES = [
  {
    key: 'prescriptions',
    label: 'Prescriptions',
    icon: 'document-text-outline',
    bg: `${AppColors.primary}15`,
    color: AppColors.primary,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'analytics-outline',
    bg: `${AppColors.secondary}15`,
    color: AppColors.secondary,
  },
  {
    key: 'history',
    label: 'Visit History',
    icon: 'time-outline',
    bg: `${AppColors.tertiary}15`,
    color: AppColors.tertiary,
  },
  {
    key: 'lab',
    label: 'Lab Tests',
    icon: 'flask-outline',
    bg: `${AppColors.primaryContainer}40`,
    color: AppColors.onPrimaryContainer,
  },
] as const;

const CATEGORY_FILTER_MAP: Record<string, DocumentRow['category'] | null> = {
  prescriptions: 'prescription',
  reports: 'report',
  history: 'visit_history',
  lab: 'lab_test',
};

const DOC_TYPE_ICON: Record<string, string> = {
  pdf: 'document-text',
  image: 'image',
};

const DOC_TYPE_COLOR: Record<string, string> = {
  pdf: AppColors.primary,
  image: AppColors.secondary,
};

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { child, bracket, age } = useChild();
  const { documents, loading: loadingDocs } = useDocuments(child?.id ?? null);
  const childName = child?.name ?? 'Child';
  const bracketKey = bracket ?? 'TODDLER';
  const bracketCfg = BRACKET_CONFIG[bracketKey];

  const allergies = child?.allergies.map(a => a.name) ?? [];
  const conditions = child?.conditions.map(c => c.name) ?? [];

  const filteredDocs = useMemo(() => {
    let docs = documents;
    if (activeFilter && CATEGORY_FILTER_MAP[activeFilter]) {
      docs = docs.filter((d) => d.category === CATEGORY_FILTER_MAP[activeFilter]);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      docs = docs.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.doctor_name?.toLowerCase().includes(q) ?? false)
      );
    }
    return docs;
  }, [documents, activeFilter, search]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Records</Text>
        <Pressable style={styles.headerAvatar} onPress={() => router.push('/profile')}>
          <Text style={styles.headerAvatarText}>{childName.charAt(0)}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Child profile card ── */}
        <LinearGradient
          colors={[AppColors.primary, '#8b3cf7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileBlobTR} />
          <View style={styles.profileBlobBL} />

          <View style={styles.profileTop}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{childName.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{childName}</Text>
              <Text style={styles.profileAge}>{age}</Text>
              <Text style={styles.profileBracket}>{bracketCfg.greetingSubtext(childName)}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{child?.weight ?? '—'} kg</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{child?.height ?? '—'} cm</Text>
              <Text style={styles.statLabel}>Height</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Blood Group</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Allergy banner ── */}
        {allergies.length > 0 && (
          <AllergyBanner allergies={allergies} />
        )}

        {/* ── Conditions ── */}
        {conditions.length > 0 && (
          <View style={styles.conditionsCard}>
            <View style={styles.conditionsHeader}>
              <Ionicons name="medical-outline" size={16} color={AppColors.secondary} />
              <Text style={styles.conditionsTitle}>Chronic Conditions</Text>
            </View>
            <View style={styles.conditionTags}>
              {conditions.map((c) => (
                <View key={c} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Search ── */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={AppColors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for documents..."
            placeholderTextColor={AppColors.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <Text style={[typography.headingMD, styles.sectionTitle]}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    isActive && styles.categoryCardActive,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={() => setActiveFilter(isActive ? null : cat.key)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Recent Records ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.headingMD, styles.sectionTitle]}>
              {activeFilter ? CATEGORIES.find(c => c.key === activeFilter)?.label ?? 'Records' : 'Recent Records'}
            </Text>
            {activeFilter && (
              <Pressable onPress={() => setActiveFilter(null)}>
                <Text style={styles.seeAll}>Clear Filter</Text>
              </Pressable>
            )}
          </View>
          {loadingDocs ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : filteredDocs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-outline" size={32} color={AppColors.outlineVariant} />
              <Text style={styles.emptyTitle}>No records yet</Text>
              <Text style={styles.emptyBody}>
                {activeFilter ? 'No documents in this category.' : 'Upload documents using the + button below.'}
              </Text>
              <Pressable style={styles.emptyBtn} onPress={() => router.push('/records/upload')}>
                <Text style={styles.emptyBtnText}>Upload Document</Text>
              </Pressable>
            </View>
          ) : (
            filteredDocs.map((doc) => (
              <View key={doc.id} style={styles.recordCard}>
                <View style={styles.recordTop}>
                  <View style={styles.recordIcon}>
                    <Ionicons
                      name={(DOC_TYPE_ICON[doc.file_type] ?? 'document') as any}
                      size={28}
                      color={DOC_TYPE_COLOR[doc.file_type] ?? AppColors.primary}
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{doc.title}</Text>
                    <Text style={styles.recordDate}>
                      {new Date(doc.document_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    {doc.doctor_name && (
                      <Text style={styles.recordDoctor}>{doc.doctor_name}</Text>
                    )}
                  </View>
                  <View style={styles.recordBadge}>
                    <Text style={[styles.recordBadgeText, { color: DOC_TYPE_COLOR[doc.file_type] ?? AppColors.primary }]}>
                      {doc.file_type.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.recordActions}>
                  <Pressable style={styles.recordActionBtn}>
                    <Ionicons name="eye-outline" size={14} color={AppColors.primary} />
                    <Text style={styles.recordActionText}>View</Text>
                  </Pressable>
                  <Pressable
                    style={styles.recordShareBtn}
                    onPress={() => Share.share({ message: `${doc.title} - ${doc.file_url}` })}
                  >
                    <Ionicons name="share-outline" size={14} color={AppColors.onSurfaceVariant} />
                    <Text style={styles.recordShareText}>Share</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: 90 + insets.bottom }]}
        onPress={() => router.push('/records/upload')}
      >
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={AppColors.onPrimary} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: AppColors.primary,
    letterSpacing: -0.3,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${AppColors.primaryContainer}55`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${AppColors.primaryContainer}80`,
  },
  headerAvatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: AppColors.primary,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 20,
  },

  // Profile card
  profileCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    gap: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  profileBlobTR: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileBlobBL: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  profileAvatarText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.5,
  },
  profileAge: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileBracket: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 16,
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  // Conditions
  conditionsCard: {
    backgroundColor: `${AppColors.secondary}0f`,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: `${AppColors.secondary}25`,
  },
  conditionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionsTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.secondary,
  },
  conditionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    backgroundColor: `${AppColors.secondary}18`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  conditionTagText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: AppColors.secondary,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurface,
  },

  // Sections
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 0,
  },
  seeAll: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.primary,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#342c38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}08`,
  },
  categoryLabelActive: {
    color: AppColors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

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

  // Record cards
  recordCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 18,
    gap: 14, shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  recordTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  recordIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: AppColors.surfaceContainer, alignItems: 'center', justifyContent: 'center',
  },
  recordInfo: { flex: 1, gap: 3 },
  recordTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  recordDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  recordDoctor: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },
  recordBadge: {
    backgroundColor: AppColors.surfaceContainer, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  recordBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
  },
  recordActions: { flexDirection: 'row', gap: 10 },
  recordActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: `${AppColors.primary}08`, borderRadius: 999, paddingVertical: 12,
  },
  recordActionText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.primary },
  recordShareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: AppColors.surfaceContainerHigh, borderRadius: 999, paddingVertical: 12,
  },
  recordShareText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurfaceVariant },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
