import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface GrowthData {
  weight: number | null;
  height: number | null;
}

interface GrowthCardsProps {
  data: GrowthData;
}

// Relative bar heights (0–1). Last bar = most recent = accent coloured.
const WEIGHT_BARS = [0.55, 0.72, 0.65, 0.85, 1.0];
const HEIGHT_BARS = [0.45, 0.6, 0.75, 0.9, 1.0];

function MiniBarChart({ bars, accent }: { bars: number[]; accent: string }) {
  return (
    <View style={chart.row}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[
            chart.bar,
            {
              height: 44 * h,
              backgroundColor: i === bars.length - 1 ? `${accent}99` : AppColors.surfaceContainerHigh,
            },
          ]}
        />
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 44,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
  },
});

export function GrowthCards({ data }: GrowthCardsProps) {
  return (
    <View style={styles.grid}>
      {/* Weight */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Weight</Text>
          <Ionicons name="scale-outline" size={18} color={AppColors.primary} />
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{data.weight ?? '—'}</Text>
          <Text style={styles.unit}>kg</Text>
        </View>
        <MiniBarChart bars={WEIGHT_BARS} accent={AppColors.primary} />
      </View>

      {/* Height */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Height</Text>
          <Ionicons name="resize-outline" size={18} color={AppColors.primary} />
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{data.height ?? '—'}</Text>
          <Text style={styles.unit}>cm</Text>
        </View>
        <MiniBarChart bars={HEIGHT_BARS} accent={AppColors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}20`,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 30,
    color: AppColors.onSurface,
    letterSpacing: -1,
  },
  unit: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
});
