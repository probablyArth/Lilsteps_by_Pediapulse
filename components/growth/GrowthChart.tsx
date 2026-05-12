import { useMemo } from 'react';
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { AppColors } from '@/constants/theme';
import type { GrowthRow } from '@/hooks/useGrowth';

import {
  ChartTab,
  REFERENCE_AGES,
  TimeFilter,
  WHO_BANDS,
  getXAxisRange,
  interpolate,
  monthsBetween,
} from './whoData';

const CHART_W = 320;
const CHART_H = 180;
const PAD = { top: 10, right: 10, bottom: 28, left: 36 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;
const SAMPLE_COUNT = 24;

function scale(val: number, min: number, max: number, size: number): number {
  if (max === min) return 0;
  return ((val - min) / (max - min)) * size;
}

function bmiOf(m: GrowthRow): number | null {
  if (!m.weight || !m.height) return null;
  const heightM = m.height / 100;
  if (heightM <= 0) return null;
  return m.weight / (heightM * heightM);
}

export function valueForTab(m: GrowthRow, tab: ChartTab): number | null {
  if (tab === 'weight') return m.weight ?? null;
  if (tab === 'height') return m.height ?? null;
  return bmiOf(m);
}

export interface GrowthChartProps {
  tab: ChartTab;
  measurements: GrowthRow[];
  dob: Date;
  timeFilter: TimeFilter;
}

export function GrowthChart({ tab, measurements, dob, timeFilter }: GrowthChartProps) {
  const currentAgeMonths = monthsBetween(dob, new Date());
  const [xMin, xMax] = getXAxisRange(timeFilter, currentAgeMonths);

  const bands = WHO_BANDS[tab];

  const sampledAges = useMemo(
    () => Array.from({ length: SAMPLE_COUNT }, (_, i) => xMin + (i / (SAMPLE_COUNT - 1)) * (xMax - xMin)),
    [xMin, xMax],
  );
  const sampled = useMemo(() => ({
    p3:  sampledAges.map((a) => interpolate(REFERENCE_AGES, bands.p3,  a)),
    p15: sampledAges.map((a) => interpolate(REFERENCE_AGES, bands.p15, a)),
    p50: sampledAges.map((a) => interpolate(REFERENCE_AGES, bands.p50, a)),
    p85: sampledAges.map((a) => interpolate(REFERENCE_AGES, bands.p85, a)),
    p97: sampledAges.map((a) => interpolate(REFERENCE_AGES, bands.p97, a)),
  }), [sampledAges, bands]);

  const childPoints: [number, number][] = useMemo(() => measurements
    .map((m) => {
      const ageMonths = monthsBetween(dob, new Date(m.measured_at));
      const val = valueForTab(m, tab);
      if (val == null) return null;
      if (ageMonths < xMin || ageMonths > xMax) return null;
      return [ageMonths, val] as [number, number];
    })
    .filter((p): p is [number, number] => p !== null)
    .sort((a, b) => a[0] - b[0]),
    [measurements, dob, tab, xMin, xMax],
  );

  const allYs = [
    ...sampled.p3, ...sampled.p97,
    ...childPoints.map(([, v]) => v),
  ];
  const minY = Math.min(...allYs) * 0.92;
  const maxY = Math.max(...allYs) * 1.05;

  const ageToX = (a: number) => PAD.left + scale(a, xMin, xMax, PLOT_W);
  const valToY = (v: number) => PAD.top + PLOT_H - scale(v, minY, maxY, PLOT_H);

  const bandPolygon = (top: number[], bottom: number[]): string => {
    const topPts = sampledAges.map((a, i) => `${ageToX(a).toFixed(1)},${valToY(top[i]).toFixed(1)}`);
    const botPts = [...sampledAges].reverse().map((a, i) => {
      const idx = sampledAges.length - 1 - i;
      return `${ageToX(a).toFixed(1)},${valToY(bottom[idx]).toFixed(1)}`;
    });
    return [...topPts, ...botPts].join(' ');
  };

  const linePath = (ys: number[]): string =>
    sampledAges.map((a, i) => `${i === 0 ? 'M' : 'L'}${ageToX(a).toFixed(1)},${valToY(ys[i]).toFixed(1)}`).join(' ');

  const childPath = (): string =>
    childPoints.map(([a, v], i) => `${i === 0 ? 'M' : 'L'}${ageToX(a).toFixed(1)},${valToY(v).toFixed(1)}`).join(' ');

  const yLabels = [minY, (minY + maxY) / 2, maxY].map((v) => +v.toFixed(tab === 'bmi' ? 1 : 0));
  const xTicks = Array.from({ length: 4 }, (_, i) => xMin + (i / 3) * (xMax - xMin));
  const formatAge = (months: number) =>
    months < 24 ? `${Math.round(months)}m` : `${(months / 12).toFixed(months % 12 === 0 ? 0 : 1)}y`;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Polygon points={bandPolygon(sampled.p85, sampled.p97)} fill={`${AppColors.primary}08`} />
      <Polygon points={bandPolygon(sampled.p15, sampled.p85)} fill={`${AppColors.primary}12`} />
      <Polygon points={bandPolygon(sampled.p3,  sampled.p15)} fill={`${AppColors.primary}08`} />

      <Path
        d={linePath(sampled.p50)}
        stroke={`${AppColors.primary}40`}
        strokeWidth={1}
        strokeDasharray="4 3"
        fill="none"
      />

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

      {yLabels.map((v, i) => (
        <SvgText
          key={i}
          x={PAD.left - 4}
          y={valToY(v) + 4}
          fontSize={9}
          fontFamily="PlusJakartaSans_400Regular"
          fill={AppColors.onSurfaceVariant}
          textAnchor="end"
        >
          {v}
        </SvgText>
      ))}

      {xTicks.map((m, i) => (
        <SvgText
          key={i}
          x={ageToX(m)}
          y={CHART_H - 6}
          fontSize={9}
          fontFamily="PlusJakartaSans_400Regular"
          fill={AppColors.onSurfaceVariant}
          textAnchor="middle"
        >
          {formatAge(m)}
        </SvgText>
      ))}

      {childPoints.length > 1 && (
        <Path
          d={childPath()}
          stroke={AppColors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {childPoints.map(([a, v], i) => (
        <Circle
          key={i}
          cx={ageToX(a)}
          cy={valToY(v)}
          r={4}
          fill={AppColors.primary}
          stroke={AppColors.surfaceContainerLowest}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}
