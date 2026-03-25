import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, PressableFeedback } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface GrowthData {
  weight: number | null;
  height: number | null;
}

interface GrowthCardsProps {
  data: GrowthData;
  onWeightPress?: () => void;
  onHeightPress?: () => void;
}

const WEIGHT_BARS = [0.45, 0.6, 0.5, 0.75, 1.0];
const HEIGHT_BARS = [0.35, 0.5, 0.65, 0.8, 1.0];

interface MiniBarChartProps {
  bars: number[];
  color: string;
}

function MiniBarChart({ bars, color }: MiniBarChartProps) {
  return (
    <View style={chartStyles.container}>
      {bars.map((h, i) => {
        const isLast = i === bars.length - 1;
        return (
          <View key={`bar-${i}-${h}`} style={chartStyles.barWrapper}>
            {isLast ? (
              <LinearGradient
                colors={[color, `${color}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                  chartStyles.bar,
                  chartStyles.activeBar,
                  { height: 36 * h },
                ]}
              />
            ) : (
              <View
                style={[
                  chartStyles.bar,
                  chartStyles.inactiveBar,
                  { height: 36 * h },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 36,
  },
  barWrapper: {
    flex: 1,
  },
  bar: {
    width: '100%',
    borderRadius: 5,
  },
  inactiveBar: {
    backgroundColor: `${AppColors.primaryContainer}55`,
  },
  activeBar: {},
});

export function GrowthCards({ data, onWeightPress, onHeightPress }: GrowthCardsProps) {
  return (
    <View style={styles.grid}>
      <PressableFeedback onPress={onWeightPress} style={styles.cardWrapper}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Weight</Text>
              <View style={styles.iconContainer}>
                <Ionicons name="scale-outline" size={14} color={AppColors.primary} />
              </View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.value}>{data.weight ?? '—'}</Text>
              <Text style={styles.unit}>kg</Text>
            </View>
            <MiniBarChart bars={WEIGHT_BARS} color={AppColors.primary} />
          </View>
        </Card>
      </PressableFeedback>

      <PressableFeedback onPress={onHeightPress} style={styles.cardWrapper}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Height</Text>
              <View style={styles.iconContainer}>
                <Ionicons name="resize-outline" size={14} color={AppColors.primary} />
              </View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.value}>{data.height ?? '—'}</Text>
              <Text style={styles.unit}>cm</Text>
            </View>
            <MiniBarChart bars={HEIGHT_BARS} color={AppColors.primary} />
          </View>
        </Card>
      </PressableFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: `${AppColors.primaryContainer}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: AppColors.onSurface,
    letterSpacing: -1,
  },
  unit: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurfaceVariant,
  },
});
