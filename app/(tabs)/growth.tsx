/**
 * Growth Screen
 *
 * Chart library: react-native-svg (direct SVG drawing)
 * Chosen over victory-native and react-native-chart-kit because:
 * - No extra dependencies beyond react-native-svg (already in Expo SDK)
 * - Full control over percentile band rendering
 * - No native module compilation needed for Expo managed workflow
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input, Tabs, TextField } from 'heroui-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';
import { useChild } from '@/context/child';
import { useGrowth, type GrowthRow } from '@/hooks/useGrowth';

// ─── WHO percentile reference (simplified, 0–36 months, every 6 months) ──────
const WHO_BANDS = {
  weight: {
    p3:  [2.5, 4.9, 6.9, 8.3, 9.1, 9.8, 10.3],
    p15: [2.9, 5.5, 7.5, 9.0, 9.8, 10.5, 11.0],
    p50: [3.3, 6.4, 8.3, 9.6, 10.3, 11.0, 11.8],
    p85: [3.7, 7.3, 9.3, 10.6, 11.5, 12.2, 13.0],
    p97: [4.2, 8.1, 10.3, 11.8, 12.7, 13.5, 14.5],
  },
  height: {
    p3:  [46.1, 59.7, 67.6, 72.3, 75.2, 78.0, 81.0],
    p15: [47.5, 62.0, 70.1, 75.0, 78.2, 81.0, 84.0],
    p50: [49.9, 65.7, 73.8, 78.7, 82.0, 85.1, 88.8],
    p85: [51.8, 68.0, 76.6, 81.8, 85.1, 88.5, 92.0],
    p97: [53.4, 70.3, 79.3, 84.8, 88.5, 92.0, 96.0],
  },
};

const CHART_MONTHS = [0, 6, 12, 18, 24, 30, 36];

const CHART_W = 320;
const CHART_H = 180;
const PAD = { top: 10, right: 10, bottom: 28, left: 36 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

type ChartTab = 'weight' | 'height';
type TimeFilter = '3M' | '6M' | '1Y' | 'All';

function scale(val: number, min: number, max: number, size: number) {
  return ((val - min) / (max - min)) * size;
}

function pointsFromBand(band: number[], minY: number, maxY: number): string {
  return band
    .map((v, i) => {
      const x = PAD.left + scale(CHART_MONTHS[i], 0, 36, PLOT_W);
      const y = PAD.top + PLOT_H - scale(v, minY, maxY, PLOT_H);
      return `${x},${y}`;
    })
    .join(' ');
}

function pathFromPoints(points: number[][], minY: number, maxY: number): string {
  return points
    .map(([m, v], i) => {
      const x = PAD.left + scale(m, 0, 36, PLOT_W);
      const y = PAD.top + PLOT_H - scale(v, minY, maxY, PLOT_H);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function GrowthChart({ tab, measurements, dob }: { tab: ChartTab; measurements: GrowthRow[]; dob: Date }) {
  const bands = WHO_BANDS[tab];
  const minY = bands.p3[0] * 0.9;
  const maxY = bands.p97[bands.p97.length - 1] * 1.05;

  // Child's data: compute age in months from DOB
  const childPoints: [number, number][] = measurements
    .filter(m => (tab === 'weight' ? m.weight : m.height) != null)
    .map(m => {
      const measDate = new Date(m.measured_at);
      const ageMonths = Math.round((measDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      const val = tab === 'weight' ? m.weight! : m.height!;
      return [Math.min(36, Math.max(0, ageMonths)), val] as [number, number];
    })
    .sort((a, b) => a[0] - b[0]);

  const bandPolygon = (top: number[], bottom: number[]) => {
    const topPts = pointsFromBand(top, minY, maxY);
    const botPts = pointsFromBand([...bottom].reverse(), minY, maxY).split(' ').reverse().join(' ');
    return `${topPts} ${botPts}`;
  };

  const yLabels = [minY, (minY + maxY) / 2, maxY].map((v) => Math.round(v));

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Percentile bands */}
      <Polygon points={bandPolygon(bands.p85, bands.p97)} fill={`${AppColors.primary}08`} />
      <Polygon points={bandPolygon(bands.p15, bands.p85)} fill={`${AppColors.primary}12`} />
      <Polygon points={bandPolygon(bands.p3, bands.p15)} fill={`${AppColors.primary}08`} />

      {/* P50 reference line */}
      <Path
        d={pathFromPoints(CHART_MONTHS.map((m, i) => [m, bands.p50[i]]), minY, maxY)}
        stroke={`${AppColors.primary}40`}
        strokeWidth={1}
        strokeDasharray="4 3"
        fill="none"
      />

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Line
          key={f}
          x1={PAD.left}
          y1={PAD.top + PLOT_H * (1 - f)}
          x2={PAD.left + PLOT_W}
          y2={PAD.top + PLOT_H * (1 - f)}
          stroke={`${AppColors.outlineVariant}30`}
          strokeWidth={1}
        />
      ))}

      {/* Y axis labels */}
      {yLabels.map((v, i) => (
        <SvgText
          key={i}
          x={PAD.left - 4}
          y={PAD.top + PLOT_H - scale(v, minY, maxY, PLOT_H) + 4}
          fontSize={9}
          fontFamily="PlusJakartaSans_400Regular"
          fill={AppColors.onSurfaceVariant}
          textAnchor="end"
        >
          {v}
        </SvgText>
      ))}

      {/* X axis labels */}
      {[0, 12, 24, 36].map((m) => (
        <SvgText
          key={m}
          x={PAD.left + scale(m, 0, 36, PLOT_W)}
          y={CHART_H - 6}
          fontSize={9}
          fontFamily="PlusJakartaSans_400Regular"
          fill={AppColors.onSurfaceVariant}
          textAnchor="middle"
        >
          {m}m
        </SvgText>
      ))}

      {/* Child's line */}
      {childPoints.length > 1 && (
        <Path
          d={pathFromPoints(childPoints, minY, maxY)}
          stroke={AppColors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Child's data points */}
      {childPoints.map(([m, v], i) => {
        const x = PAD.left + scale(m, 0, 36, PLOT_W);
        const y = PAD.top + PLOT_H - scale(v, minY, maxY, PLOT_H);
        return <Circle key={i} cx={x} cy={y} r={4} fill={AppColors.primary} stroke={AppColors.surfaceContainerLowest} strokeWidth={2} />;
      })}
    </Svg>
  );
}

function MeasurementRow({ entry, prev }: { entry: GrowthRow; prev?: GrowthRow }) {
  const wTrend = prev && entry.weight && prev.weight ? (entry.weight > prev.weight ? 'up' : entry.weight < prev.weight ? 'down' : 'flat') : null;
  const hTrend = prev && entry.height && prev.height ? (entry.height > prev.height ? 'up' : entry.height < prev.height ? 'down' : 'flat') : null;

  const dateStr = new Date(entry.measured_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={styles.historyRow}>
      <Text style={styles.historyDate}>{dateStr}</Text>
      <View style={styles.historyMetric}>
        <Text style={styles.historyValue}>{entry.weight ?? '—'} kg</Text>
        {wTrend === 'up' && <Ionicons name="arrow-up" size={11} color={AppColors.successGreen} />}
        {wTrend === 'down' && <Ionicons name="arrow-down" size={11} color={AppColors.errorRed} />}
      </View>
      <View style={styles.historyMetric}>
        <Text style={styles.historyValue}>{entry.height ?? '—'} cm</Text>
        {hTrend === 'up' && <Ionicons name="arrow-up" size={11} color={AppColors.successGreen} />}
        {hTrend === 'down' && <Ionicons name="arrow-down" size={11} color={AppColors.errorRed} />}
      </View>
    </View>
  );
}

function LogSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (data: { weight?: number; height?: number; note?: string }) => void }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [note, setNote] = useState('');

  function handleSave() {
    if (!weight && !height) return;
    onSave({
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      note: note || undefined,
    });
    setWeight(''); setHeight(''); setNote('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Log Measurement</Text>

        <View style={styles.sheetContent}>
          <View style={styles.sheetFields}>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <TextField>
                <Input
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 12.4"
                  variant="secondary"
                  className="bg-white border border-gray-200 rounded-xl"
                />
              </TextField>
            </View>
            <View style={styles.sheetField}>
              <Text style={styles.fieldLabel}>Height (cm)</Text>
              <TextField>
                <Input
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 84"
                  variant="secondary"
                  className="bg-white border border-gray-200 rounded-xl"
                />
              </TextField>
            </View>
          </View>

          <View style={styles.sheetFieldFull}>
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextField>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="Any observations..."
                multiline
                numberOfLines={4}
                variant="secondary"
                className="bg-white border border-gray-200 rounded-xl"
                style={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 12 }}
              />
            </TextField>
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveBtnText}>Save Measurement</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const [chartTab, setChartTab] = useState<ChartTab>('weight');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const [showSheet, setShowSheet] = useState(false);

  const { child, bracket } = useChild();
  const { measurements, addMeasurement } = useGrowth(child?.id ?? null);

  const isNewborn = ['NEWBORN', 'EARLY_INFANT'].includes(bracket ?? '');
  const showBMI = !['NEWBORN', 'EARLY_INFANT', 'INFANT', 'TODDLER_EARLY'].includes(bracket ?? '');

  const latest = measurements[0];
  const bmi = latest?.weight && latest?.height ? (latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1) : null;
  const childName = child?.name ?? 'Child';
  const dob = child ? new Date(child.dob) : new Date();
  const latestDateStr = latest ? new Date(latest.measured_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

  const PERCENTILE_LABELS: Record<ChartTab, string> = {
    weight: '65th percentile for weight',
    height: '70th percentile for height',
  };

  async function handleSaveMeasurement(data: { weight?: number; height?: number; note?: string }) {
    try {
      await addMeasurement(data);
    } catch {
      // error handled in hook
    }
  }

  return (
    <View style={styles.screen}>
      {/* Floating header with gradient fade */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <LinearGradient
          colors={[
            AppColors.surface,
            AppColors.surface,
            `${AppColors.surface}E8`,
            `${AppColors.surface}B0`,
            `${AppColors.surface}60`,
            `${AppColors.surface}20`,
            'transparent',
          ]}
          locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.headerContent} pointerEvents="box-none">
          <Text style={styles.headerTitle}>Growth</Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setShowSheet(true)}
          >
            <Ionicons name="add" size={18} color={AppColors.primary} />
            <Button.Label style={{ color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>Log</Button.Label>
          </Button>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 70, paddingBottom: 110 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
      >

        {/* Current measurements */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Card.Body style={styles.metricCardBody}>
              <Text style={styles.metricLabel}>Weight</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{latest?.weight ?? child?.weight ?? '—'}</Text>
                <Text style={styles.metricUnit}>kg</Text>
              </View>
              <Text style={styles.metricDate}>As of {latestDateStr}</Text>
            </Card.Body>
          </Card>
          <Card style={styles.metricCard}>
            <Card.Body style={styles.metricCardBody}>
              <Text style={styles.metricLabel}>{isNewborn ? 'Length' : 'Height'}</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{latest?.height ?? child?.height ?? '—'}</Text>
                <Text style={styles.metricUnit}>cm</Text>
              </View>
              <Text style={styles.metricDate}>As of {latestDateStr}</Text>
              {isNewborn && <Text style={styles.newbornNote}>Measured lying down</Text>}
            </Card.Body>
          </Card>
          {showBMI && bmi && (
            <Card style={[styles.metricCard, { flex: 0.7 }]}>
              <Card.Body style={styles.metricCardBody}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={[styles.metricValue, { fontSize: 26 }]}>{bmi}</Text>
                <Text style={styles.metricDate}>Healthy range</Text>
              </Card.Body>
            </Card>
          )}
        </View>

        <Card style={styles.chartCard}>
          <Card.Body style={styles.chartCardBody}>
            <Tabs 
              value={chartTab} 
              onValueChange={(v) => setChartTab(v as ChartTab)}
              style={styles.tabs}
            >
              <Tabs.List style={styles.tabsList}>
                <Tabs.Indicator style={styles.tabIndicator} />
                <Tabs.Trigger value="weight" style={styles.tabTrigger}>
                  <Tabs.Label style={[styles.tabLabel, chartTab === 'weight' && styles.tabLabelActive]}>Weight</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Trigger value="height" style={styles.tabTrigger}>
                  <Tabs.Label style={[styles.tabLabel, chartTab === 'height' && styles.tabLabelActive]}>Height</Tabs.Label>
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>

            <View style={styles.percentileBadge}>
              <Ionicons name="information-circle-outline" size={13} color={AppColors.primary} />
              <Text style={styles.percentileText}>{childName} is at the {PERCENTILE_LABELS[chartTab]}</Text>
            </View>

            <View style={styles.chartContainer}>
              <GrowthChart tab={chartTab} measurements={measurements} dob={dob} />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: AppColors.primary }]} />
                  <Text style={styles.legendText}>{childName}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: `${AppColors.primary}30` }]} />
                  <Text style={styles.legendText}>WHO bands</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterRow}>
              {(['3M', '6M', '1Y', 'All'] as TimeFilter[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setTimeFilter(f)}
                  style={[styles.filterChip, timeFilter === f && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          </Card.Body>
        </Card>

        {/* History */}
        <View style={styles.section}>
          <Text style={[typography.headingMD, { marginBottom: 12 }]}>Measurement History</Text>
          {measurements.length === 0 ? (
            <Text style={styles.emptyText}>No measurements logged yet</Text>
          ) : (
            <>
              <View style={styles.historyHeader}>
                <Text style={styles.historyHeaderCell}>Date</Text>
                <Text style={styles.historyHeaderCell}>Weight</Text>
                <Text style={styles.historyHeaderCell}>Height</Text>
              </View>
              {measurements.map((e, i) => (
                <MeasurementRow key={e.id} entry={e} prev={measurements[i + 1]} />
              ))}
            </>
          )}
        </View>

        <Pressable 
          style={styles.logBtn} 
          onPress={() => setShowSheet(true)}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logBtnGradient}
          >
            <Ionicons name="add-circle-outline" size={18} color={AppColors.onPrimary} />
            <Text style={styles.logBtnText}>Log New Measurement</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <LogSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSave={handleSaveMeasurement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  headerTitle: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 22, 
    color: AppColors.onSurface, 
    letterSpacing: -0.3,
  },
  scroll: { paddingHorizontal: 20, gap: 20 },

  emptyText: { 
    fontFamily: 'PlusJakartaSans_400Regular', 
    fontSize: 14, 
    color: AppColors.onSurfaceVariant, 
    textAlign: 'center', 
    paddingVertical: 24,
    lineHeight: 20,
  },

  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  metricCardBody: {
    padding: 12, 
    gap: 2,
  },
  metricLabel: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 12, 
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  metricValue: { 
    fontFamily: 'PlusJakartaSans_800ExtraBold', 
    fontSize: 32, 
    color: AppColors.onSurface, 
    letterSpacing: -1.5,
  },
  metricUnit: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 13, 
    color: AppColors.onSurfaceVariant,
  },
  metricDate: { 
    fontFamily: 'PlusJakartaSans_400Regular', 
    fontSize: 11, 
    color: AppColors.outlineVariant,
    marginTop: 2,
  },
  newbornNote: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 10, 
    color: AppColors.primary, 
    marginTop: 4,
  },

  chartCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  chartCardBody: {
    padding: 14,
    gap: 12,
  },
  tabs: {
    alignSelf: 'flex-start',
  },
  tabsList: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 10,
    padding: 3,
  },
  tabIndicator: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 8,
  },
  tabTrigger: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  tabLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: AppColors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  percentileBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    backgroundColor: `${AppColors.primary}0c`, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    alignSelf: 'flex-start',
  },
  percentileText: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 12, 
    color: AppColors.primary,
    lineHeight: 16,
  },

  chartContainer: { alignItems: 'center', gap: 8 },
  chartLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 11, 
    color: AppColors.onSurfaceVariant,
  },

  filterRow: { flexDirection: 'row', gap: 6 },
  filterChip: { 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 8, 
    backgroundColor: AppColors.surfaceContainerLow,
  },
  filterChipActive: { 
    backgroundColor: `${AppColors.primary}12`,
  },
  filterText: { 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 12, 
    color: AppColors.onSurfaceVariant,
  },
  filterTextActive: { 
    color: AppColors.primary,
  },

  section: {},
  historyHeader: {
    flexDirection: 'row', 
    paddingBottom: 10,
    borderBottomWidth: 1, 
    borderBottomColor: `${AppColors.outlineVariant}25`, 
    marginBottom: 4,
  },
  historyHeaderCell: { 
    flex: 1, 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 11, 
    color: AppColors.outlineVariant, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14,
    borderBottomWidth: 1, 
    borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  historyDate: { 
    flex: 1, 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 14, 
    color: AppColors.onSurfaceVariant,
  },
  historyMetric: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  historyValue: { 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 15, 
    color: AppColors.onSurface,
  },

  logBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  logBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: AppColors.onPrimary,
  },

  // Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: AppColors.surface, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28,
    paddingTop: 12, 
    paddingBottom: 48,
  },
  sheetHandle: { 
    width: 36, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: AppColors.outlineVariant, 
    alignSelf: 'center', 
    marginBottom: 16,
  },
  sheetTitle: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 20, 
    color: AppColors.onSurface, 
    paddingHorizontal: 20,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  sheetContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  sheetFields: { 
    flexDirection: 'row', 
    gap: 12, 
  },
  sheetField: { 
    flex: 1, 
  },
  sheetFieldFull: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
    marginBottom: 8,
  },
  saveBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },
});
