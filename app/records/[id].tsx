import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDocuments } from '@/hooks/useDocuments';

const CATEGORY_LABEL: Record<string, string> = {
  prescription: 'PRESCRIPTION',
  report: 'MEDICAL REPORT',
  lab_test: 'LAB TEST',
  visit_history: 'VISIT HISTORY',
  other: 'DOCUMENT',
};

const CATEGORY_COLOR: Record<string, string> = {
  prescription: AppColors.primary,
  report: AppColors.secondary,
  lab_test: AppColors.tertiary,
  visit_history: AppColors.accentBlue,
  other: AppColors.onSurfaceVariant,
};

const CATEGORY_STATUS_TAG: Record<string, string> = {
  prescription: 'Prescribed',
  report: 'Medical Report',
  lab_test: 'Lab Result',
  visit_history: 'Visit Record',
  other: 'On File',
};

export default function RecordDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child } = useChild();
  const { documents, loading } = useDocuments(child?.id ?? null);

  const doc = documents.find(d => d.id === id);

  const formattedDate = doc
    ? new Date(doc.document_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const formattedUpdated = doc
    ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' +
      new Date(doc.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  const fileSizeLabel = doc?.file_size
    ? doc.file_size > 1024 * 1024
      ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(doc.file_size / 1024)} KB`
    : null;

  const categoryLabel = doc ? (CATEGORY_LABEL[doc.category] ?? 'DOCUMENT') : '';
  const categoryColor = doc ? (CATEGORY_COLOR[doc.category] ?? AppColors.primary) : AppColors.primary;
  const categoryStatusTag = doc ? (CATEGORY_STATUS_TAG[doc.category] ?? 'On File') : '';

  async function handleShare() {
    if (!doc) return;
    await Share.share({ message: `${doc.title} - ${doc.file_url}` });
  }

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.centered]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }, styles.centered]}>
        <Ionicons name="document-outline" size={48} color={AppColors.outlineVariant} />
        <Text style={styles.notFoundText}>Record not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Medical Record</Text>
        <Pressable style={styles.iconBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={AppColors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title section ── */}
        <View style={styles.titleSection}>
          <View style={[styles.categoryPill, { backgroundColor: `${categoryColor}18` }]}>
            <Text style={[styles.categoryPillText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
          <Text style={styles.docTitle}>{doc.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={AppColors.onSurfaceVariant} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            {doc.doctor_name && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color={AppColors.onSurfaceVariant} />
                <Text style={styles.metaText}>{doc.doctor_name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Quick Summary ── */}
        <View style={styles.glassCard}>
          <Text style={styles.cardLabel}>QUICK SUMMARY</Text>
          <Text style={styles.summaryBody}>
            {doc.notes || 'This document has been stored securely in your health records.'}
          </Text>
          <View style={styles.summaryTags}>
            <View style={styles.tagGreen}>
              <Text style={styles.tagGreenText}>{categoryStatusTag}</Text>
            </View>
            <View style={styles.tagBlue}>
              <Text style={styles.tagBlueText}>{doc.file_type === 'pdf' ? 'PDF Doc' : 'Image File'}</Text>
            </View>
          </View>
          <View style={styles.cardFooterDivider} />
          <Text style={styles.summaryFooter}>Last updated {formattedUpdated}</Text>
        </View>

        {/* ── Download card ── */}
        <View style={styles.downloadCard}>
          <View style={styles.downloadIconWrap}>
            <Ionicons
              name={doc.file_type === 'pdf' ? 'document-text' : 'image'}
              size={38}
              color={AppColors.primary}
            />
          </View>
          <Text style={styles.downloadTitle}>
            {doc.file_type === 'pdf' ? 'Official PDF Report' : 'Image Document'}
          </Text>
          {fileSizeLabel && (
            <Text style={styles.downloadMeta}>
              {doc.title.length > 22 ? doc.title.substring(0, 22) + '…' : doc.title}.{doc.file_type} ({fileSizeLabel})
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [styles.downloadBtn, { opacity: pressed ? 0.88 : 1 }]}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadBtnGrad}
            >
              <Ionicons name="download-outline" size={18} color={AppColors.onPrimary} />
              <Text style={styles.downloadBtnText}>Download File</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Patient Vitals ── */}
        {(child?.weight || child?.height) && (
          <View style={styles.glassCard}>
            <Text style={styles.cardLabel}>PATIENT VITALS</Text>
            <View style={styles.vitalsRow}>
              <View style={styles.vitalsItem}>
                <Text style={styles.vitalsValue}>{child?.weight ?? '—'} kg</Text>
                <Text style={styles.vitalsLabel}>Weight</Text>
              </View>
              <View style={styles.vitalsDivider} />
              <View style={styles.vitalsItem}>
                <Text style={styles.vitalsValue}>{child?.height ?? '—'} cm</Text>
                <Text style={styles.vitalsLabel}>Height</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Document Details ── */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconBox}>
              <Ionicons name="clipboard-outline" size={16} color={AppColors.secondary} />
            </View>
            <Text style={styles.cardHeading}>Document Details</Text>
          </View>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Category</Text>
              <Text style={styles.detailValue}>{CATEGORY_LABEL[doc.category] ?? doc.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>File Type</Text>
              <Text style={styles.detailValue}>{doc.file_type.toUpperCase()}</Text>
            </View>
            {doc.doctor_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Doctor</Text>
                <Text style={styles.detailValue}>{doc.doctor_name}</Text>
              </View>
            )}
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailKey}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* ── Next Steps gradient banner ── */}
        <LinearGradient
          colors={[AppColors.primary, AppColors.primaryDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nextBanner}
        >
          <View style={styles.bannerBlob} />
          <View style={styles.bannerInner}>
            <Text style={styles.bannerTitle}>Next Steps & Care</Text>
            <View style={styles.bannerItems}>
              <View style={styles.bannerItem}>
                <Ionicons name="information-circle-outline" size={16} color={AppColors.secondaryContainer} />
                <Text style={styles.bannerItemText}>Keep this record handy for your next consultation.</Text>
              </View>
              <View style={styles.bannerItem}>
                <Ionicons name="calendar-outline" size={16} color={AppColors.secondaryContainer} />
                <Text style={styles.bannerItemText}>Schedule a follow-up to track ongoing health progress.</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.bannerBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={() => router.push('/consult/booking')}
            >
              <Text style={styles.bannerBtnText}>Book Next Visit</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: `${AppColors.surfaceContainer}60`,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface,
  },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  // Title section
  titleSection: { gap: 10 },
  categoryPill: {
    alignSelf: 'flex-start', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  categoryPillText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11, letterSpacing: 1,
  },
  docTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26,
    color: AppColors.onSurface, letterSpacing: -0.5, lineHeight: 34,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant,
  },

  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 20, padding: 20, gap: 12,
    borderWidth: 1, borderColor: `${AppColors.outlineVariant}15`,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 10,
    color: AppColors.primary, letterSpacing: 1.5,
  },
  summaryBody: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurface, lineHeight: 22,
  },
  summaryTags: { flexDirection: 'row', gap: 8 },
  tagGreen: {
    backgroundColor: AppColors.successGreenSurface, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagGreenText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10,
    color: AppColors.successGreen, letterSpacing: 0.5,
  },
  tagBlue: {
    backgroundColor: `${AppColors.accentBlue}15`, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagBlueText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10,
    color: AppColors.accentBlue, letterSpacing: 0.5,
  },
  cardFooterDivider: {
    height: 1, backgroundColor: `${AppColors.outlineVariant}20`,
  },
  summaryFooter: {
    fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.onSurfaceVariant,
  },

  // Download card
  downloadCard: {
    backgroundColor: `${AppColors.primary}07`, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: `${AppColors.primary}12`,
  },
  downloadIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: AppColors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  downloadTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface,
  },
  downloadMeta: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant,
    textAlign: 'center',
  },
  downloadBtn: { width: '100%', borderRadius: 999, overflow: 'hidden', marginTop: 4 },
  downloadBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  downloadBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onPrimary,
  },

  // Vitals
  vitalsRow: {
    flexDirection: 'row', backgroundColor: `${AppColors.surfaceContainer}80`,
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 8,
  },
  vitalsItem: { flex: 1, alignItems: 'center', gap: 3 },
  vitalsValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onSurface,
  },
  vitalsLabel: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant,
  },
  vitalsDivider: { width: 1, backgroundColor: `${AppColors.outlineVariant}40`, marginVertical: 4 },

  // Card with heading
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBox: {
    width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: `${AppColors.secondary}18`,
  },
  cardHeading: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface,
  },
  detailsList: { gap: 0 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailKey: {
    fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface,
  },

  // Next Steps banner
  nextBanner: {
    borderRadius: 20, padding: 24, overflow: 'hidden',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  bannerBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bannerInner: { gap: 16 },
  bannerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: AppColors.onPrimary,
  },
  bannerItems: { gap: 10 },
  bannerItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bannerItemText: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13,
    color: `${AppColors.onPrimary}D9`, lineHeight: 20, flex: 1,
  },
  bannerBtn: {
    alignSelf: 'flex-start', backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  bannerBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.primary,
  },

  // Not found
  notFoundText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface,
  },
  backLink: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.primary,
  },
});
