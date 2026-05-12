import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface SummaryDetail {
  label: string;
  value: string;
}

export interface CheckinSummaryShape {
  chiefComplaint: string;
  details: SummaryDetail[];
  relevantHistory?: string | null;
  allergyNote?: string | null;
}

export interface SummaryCardProps {
  summary: CheckinSummaryShape;
  childName: string;
}

export function SummaryCard({ summary, childName }: SummaryCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Body style={styles.body}>
        <View style={styles.header}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color={AppColors.primary} />
            <Text style={styles.aiBadgeText}>AI Summary</Text>
          </View>
          <Text style={styles.childName}>{childName}</Text>
        </View>
        <Text style={styles.complaint}>{summary.chiefComplaint}</Text>

        <View style={styles.divider} />

        {summary.details.map((d, i) => (
          <View
            key={d.label}
            style={[styles.detailRow, i === summary.details.length - 1 && styles.detailRowLast]}
          >
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue}>{d.value}</Text>
          </View>
        ))}

        {summary.relevantHistory && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={AppColors.primary} />
            <Text style={styles.infoText}>{summary.relevantHistory}</Text>
          </View>
        )}

        {summary.allergyNote && (
          <View style={styles.warningRow}>
            <Ionicons name="warning-outline" size={14} color={AppColors.warningAmber} />
            <Text style={styles.warningText}>{summary.allergyNote}</Text>
          </View>
        )}
      </Card.Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${AppColors.primary}20`,
  },
  body: { padding: 18, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${AppColors.primary}12`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  aiBadgeText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: AppColors.primary },
  childName: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },
  complaint: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: AppColors.onSurface,
    letterSpacing: -0.3,
  },
  divider: { height: 1, backgroundColor: `${AppColors.outlineVariant}20`, marginVertical: 4 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    flex: 1,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 2,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: `${AppColors.primary}08`,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  warningRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: `${AppColors.warningAmber}10`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${AppColors.warningAmber}30`,
  },
  warningText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
});
