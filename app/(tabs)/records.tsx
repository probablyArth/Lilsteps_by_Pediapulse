import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDocuments, type DocumentRow } from '@/hooks/useDocuments';

const CATEGORIES = [
  { key: 'prescriptions', label: 'Prescriptions',  icon: 'document-text-outline', color: AppColors.primary,          bg: `${AppColors.primary}12`          },
  { key: 'reports',       label: 'Reports',         icon: 'analytics-outline',     color: AppColors.secondary,        bg: `${AppColors.secondary}12`        },
  { key: 'history',       label: 'Visit History',   icon: 'time-outline',          color: AppColors.tertiary,         bg: `${AppColors.tertiary}12`         },
  { key: 'lab',           label: 'Lab Tests',       icon: 'flask-outline',         color: AppColors.onPrimaryContainer, bg: `${AppColors.primaryContainer}30` },
] as const;

const CATEGORY_FILTER_MAP: Record<string, DocumentRow['category'] | null> = {
  prescriptions: 'prescription',
  reports:       'report',
  history:       'visit_history',
  lab:           'lab_test',
};

const CATEGORY_PILL_LABEL: Record<DocumentRow['category'], string> = {
  prescription:  'Prescription',
  report:        'Report',
  lab_test:      'Lab Test',
  visit_history: 'Visit',
  other:         'Document',
};

const CATEGORY_PILL_COLOR: Record<DocumentRow['category'], string> = {
  prescription:  AppColors.primary,
  report:        AppColors.secondary,
  lab_test:      AppColors.tertiary,
  visit_history: AppColors.accentBlue,
  other:         AppColors.onSurfaceVariant,
};

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { child } = useChild();
  const { documents, loading: loadingDocs } = useDocuments(child?.id ?? null);
  const childName = child?.name ?? 'Child';

  const filteredDocs = useMemo(() => {
    let docs = documents;
    if (activeFilter && CATEGORY_FILTER_MAP[activeFilter]) {
      docs = docs.filter(d => d.category === CATEGORY_FILTER_MAP[activeFilter]);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      docs = docs.filter(d =>
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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Health Records</Text>
          <Text style={styles.headerSub}>{childName}&apos;s medical history</Text>
        </View>
        <Pressable style={styles.headerAvatar} onPress={() => router.push('/profile')}>
          <Text style={styles.headerAvatarText}>{childName.charAt(0)}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={AppColors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search records, doctors…"
            placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={AppColors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>

        {/* ── Category grid ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => {
              const active = activeFilter === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={({ pressed }) => [
                    styles.catCard,
                    active && styles.catCardActive,
                    { opacity: pressed ? 0.78 : 1 },
                  ]}
                  onPress={() => setActiveFilter(active ? null : cat.key)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: active ? `${cat.color}22` : cat.bg }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text style={[styles.catLabel, active && { color: cat.color, fontFamily: 'PlusJakartaSans_700Bold' }]}>
                    {cat.label}
                  </Text>
                  {active && (
                    <View style={[styles.catActiveDot, { backgroundColor: cat.color }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Records list ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {activeFilter ? CATEGORIES.find(c => c.key === activeFilter)?.label ?? 'Records' : 'All Records'}
            </Text>
            {activeFilter && (
              <Pressable onPress={() => setActiveFilter(null)}>
                <Text style={styles.clearBtn}>Clear filter</Text>
              </Pressable>
            )}
          </View>

          {loadingDocs ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={AppColors.primary} />
              <Text style={styles.loadingText}>Loading records…</Text>
            </View>
          ) : filteredDocs.length === 0 ? (
            <EmptyState hasFilter={!!activeFilter || search.length > 0} />
          ) : (
            filteredDocs.map(doc => (
              <RecordCard
                key={doc.id}
                doc={doc}
                onPress={() => router.push(`/records/${doc.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 80 }]}
        onPress={() => router.push('/records/upload')}
      >
        <LinearGradient
          colors={[AppColors.primary, AppColors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGrad}
        >
          <Ionicons name="add" size={28} color={AppColors.onPrimary} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RecordCard({ doc, onPress }: { doc: DocumentRow; onPress: () => void }) {
  const pillColor = CATEGORY_PILL_COLOR[doc.category] ?? AppColors.primary;
  const pillLabel = CATEGORY_PILL_LABEL[doc.category] ?? 'Document';
  const formattedDate = new Date(doc.document_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const isPdf = doc.file_type === 'pdf';

  return (
    <Pressable
      style={({ pressed }) => [styles.recordCard, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {/* Icon + info */}
      <View style={styles.recordTop}>
        <View style={[styles.recordIconWrap, { backgroundColor: `${pillColor}12` }]}>
          <Ionicons
            name={isPdf ? 'document-text' : 'image'}
            size={26}
            color={pillColor}
          />
        </View>

        <View style={styles.recordInfo}>
          <View style={styles.recordTitleRow}>
            <Text style={styles.recordTitle} numberOfLines={1}>{doc.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: `${pillColor}12` }]}>
              <Text style={[styles.typeBadgeText, { color: pillColor }]}>
                {doc.file_type.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.recordMeta}>
            <Ionicons name="calendar-outline" size={12} color={AppColors.onSurfaceVariant} />
            <Text style={styles.recordMetaText}>{formattedDate}</Text>
            {doc.doctor_name && (
              <>
                <View style={styles.metaDot} />
                <Ionicons name="person-outline" size={12} color={AppColors.onSurfaceVariant} />
                <Text style={styles.recordMetaText} numberOfLines={1}>{doc.doctor_name}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Category pill + actions */}
      <View style={styles.recordBottom}>
        <View style={[styles.catPill, { backgroundColor: `${pillColor}10` }]}>
          <Text style={[styles.catPillText, { color: pillColor }]}>{pillLabel}</Text>
        </View>
        <View style={styles.recordActions}>
          <Pressable style={styles.actionBtn} onPress={onPress}>
            <Ionicons name="eye-outline" size={14} color={AppColors.primary} />
            <Text style={styles.actionBtnText}>View</Text>
          </Pressable>
          <View style={styles.actionDivider} />
          <Pressable style={styles.actionBtn} onPress={onPress}>
            <Ionicons name="arrow-forward" size={14} color={AppColors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Notes snippet */}
      {doc.notes && (
        <Text style={styles.recordNotes} numberOfLines={2}>{doc.notes}</Text>
      )}
    </Pressable>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="folder-open-outline" size={36} color={AppColors.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {hasFilter ? 'No matching records' : 'No records yet'}
      </Text>
      <Text style={styles.emptyBody}>
        {hasFilter
          ? 'Try clearing the filter or search term.'
          : 'Upload prescriptions, reports, and lab tests to keep everything in one place.'}
      </Text>
      {!hasFilter && (
        <Pressable
          style={styles.emptyBtn}
          onPress={() => router.push('/records/upload')}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyBtnGrad}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={AppColors.onPrimary} />
            <Text style={styles.emptyBtnText}>Upload First Record</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  headerLeft: { gap: 2 },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22,
    color: AppColors.onSurface, letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${AppColors.primaryContainer}55`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${AppColors.primaryContainer}80`,
  },
  headerAvatarText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.primary,
  },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },

  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}20`,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchInput: {
    flex: 1, fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14, color: AppColors.onSurface,
  },

  // Section
  section: { gap: 14 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17,
    color: AppColors.onSurface, letterSpacing: -0.3,
  },
  clearBtn: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.primary,
  },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    width: '47%',
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}15`,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  catCardActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}06`,
  },
  catIconWrap: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  catLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  catActiveDot: {
    position: 'absolute', top: 12, right: 12,
    width: 8, height: 8, borderRadius: 4,
  },

  // Loading
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 20 },
  loadingText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurfaceVariant },

  // Record card
  recordCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20, padding: 18, gap: 14,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}15`,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  recordTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  recordIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  recordInfo: { flex: 1, gap: 6 },
  recordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15,
    color: AppColors.onSurface, flex: 1,
  },
  typeBadge: {
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  typeBadgeText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 9, letterSpacing: 0.8,
  },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  recordMetaText: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant,
  },
  metaDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: AppColors.outlineVariant,
  },

  recordBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catPill: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  catPillText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, letterSpacing: 0.3,
  },
  recordActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  actionBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.primary },
  actionDivider: { width: 1, height: 14, backgroundColor: `${AppColors.outlineVariant}40` },
  recordNotes: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12,
    color: AppColors.onSurfaceVariant, lineHeight: 18,
    paddingTop: 4, borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}15`,
  },

  // Empty state
  emptyCard: {
    borderRadius: 20, padding: 28, alignItems: 'center', gap: 12,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}15`,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface,
  },
  emptyBody: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13,
    color: AppColors.onSurfaceVariant, textAlign: 'center', lineHeight: 20,
  },
  emptyBtn: { marginTop: 4, borderRadius: 999, overflow: 'hidden' },
  emptyBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  emptyBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onPrimary,
  },

  // FAB
  fab: {
    position: 'absolute', right: 24, zIndex: 50,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  fabGrad: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
});
