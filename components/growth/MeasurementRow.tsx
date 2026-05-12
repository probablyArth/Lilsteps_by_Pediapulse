import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { GrowthRow } from '@/hooks/useGrowth';

export function MeasurementRow({ entry, prev }: { entry: GrowthRow; prev?: GrowthRow }) {
  const wTrend = prev && entry.weight && prev.weight
    ? (entry.weight > prev.weight ? 'up' : entry.weight < prev.weight ? 'down' : 'flat')
    : null;
  const hTrend = prev && entry.height && prev.height
    ? (entry.height > prev.height ? 'up' : entry.height < prev.height ? 'down' : 'flat')
    : null;

  const dateStr = new Date(entry.measured_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={styles.row}>
      <Text style={styles.date}>{dateStr}</Text>
      <View style={styles.metric}>
        <Text style={styles.value}>{entry.weight ?? '—'} kg</Text>
        {wTrend === 'up' && <Ionicons name="arrow-up" size={11} color={AppColors.successGreen} />}
        {wTrend === 'down' && <Ionicons name="arrow-down" size={11} color={AppColors.errorRed} />}
      </View>
      <View style={styles.metric}>
        <Text style={styles.value}>{entry.height ?? '—'} cm</Text>
        {hTrend === 'up' && <Ionicons name="arrow-up" size={11} color={AppColors.successGreen} />}
        {hTrend === 'down' && <Ionicons name="arrow-down" size={11} color={AppColors.errorRed} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  date: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurface,
  },
});
