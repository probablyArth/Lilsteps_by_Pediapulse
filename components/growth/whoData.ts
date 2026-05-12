/**
 * WHO percentile reference (sex-neutral approximation, 0–180 months).
 *
 * Reference ages span 0–15 years so the chart works for every bracket.
 * Values are sex-neutral medians; close enough for parent-facing visualisation.
 * For clinical use, swap in exact WHO Boys/Girls tables.
 */

export const REFERENCE_AGES = [0, 6, 12, 24, 36, 60, 96, 144, 180] as const;

export type ChartTab = 'weight' | 'height' | 'bmi';

export interface PercentileBands {
  p3: number[];
  p15: number[];
  p50: number[];
  p85: number[];
  p97: number[];
}

export const WHO_BANDS: Record<ChartTab, PercentileBands> = {
  weight: {
    p3:  [2.6,  6.2,  7.5,  9.5,  11.2, 14.3, 19.8, 30.8, 43.7],
    p15: [2.9,  7.0,  8.4,  10.7, 12.6, 16.1, 22.4, 34.8, 49.3],
    p50: [3.3,  7.9,  9.6,  12.2, 14.3, 18.3, 25.4, 39.5, 56.0],
    p85: [3.7,  8.9,  10.8, 13.8, 16.2, 20.7, 28.7, 44.6, 63.3],
    p97: [4.1,  9.9,  12.0, 15.3, 17.9, 22.9, 31.8, 49.4, 70.0],
  },
  height: {
    p3:  [46.9, 63.5, 71.2, 81.9,  90.3,  103.4, 120.4, 140.3, 157.9],
    p15: [48.4, 65.6, 73.4, 84.5,  93.2,  106.7, 124.3, 144.8, 163.0],
    p50: [49.9, 67.6, 75.7, 87.1,  96.1,  110.0, 128.1, 149.3, 168.0],
    p85: [51.4, 69.6, 78.0, 89.7,  99.0,  113.3, 131.9, 153.8, 173.0],
    p97: [52.9, 71.7, 80.2, 92.3,  101.9, 116.6, 135.8, 158.3, 178.1],
  },
  bmi: {
    p3:  [12.0, 13.5, 13.0, 12.6, 12.5, 12.5, 13.0, 13.8, 14.5],
    p15: [12.8, 14.5, 14.0, 13.6, 13.5, 13.7, 14.2, 15.2, 16.0],
    p50: [13.8, 15.8, 15.6, 16.0, 15.7, 15.4, 16.0, 17.0, 18.5],
    p85: [14.8, 17.0, 17.2, 18.2, 18.0, 17.5, 18.2, 19.5, 21.5],
    p97: [16.0, 18.5, 18.8, 20.0, 20.0, 19.5, 20.5, 22.0, 24.5],
  },
};

export type TimeFilter = '3M' | '6M' | '1Y' | 'All';

export function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
}

export function interpolate(xs: readonly number[], ys: number[], target: number): number {
  if (target <= xs[0]) return ys[0];
  if (target >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (target >= xs[i] && target <= xs[i + 1]) {
      const t = (target - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}

export function getXAxisRange(filter: TimeFilter, currentAgeMonths: number): [number, number] {
  const minSpan = 6;
  const span =
    filter === '3M' ? Math.max(3, minSpan) :
    filter === '6M' ? 6 :
    filter === '1Y' ? 12 :
    Math.max(currentAgeMonths, minSpan);
  const xMin = Math.max(0, currentAgeMonths - span);
  const xMax = Math.max(currentAgeMonths, xMin + minSpan);
  return [xMin, xMax];
}

export function computePercentile(value: number, ageMonths: number, tab: ChartTab): number {
  const b = WHO_BANDS[tab];
  const v3  = interpolate(REFERENCE_AGES, b.p3,  ageMonths);
  const v15 = interpolate(REFERENCE_AGES, b.p15, ageMonths);
  const v50 = interpolate(REFERENCE_AGES, b.p50, ageMonths);
  const v85 = interpolate(REFERENCE_AGES, b.p85, ageMonths);
  const v97 = interpolate(REFERENCE_AGES, b.p97, ageMonths);
  if (value <= v3)  return 3;
  if (value <= v15) return 3  + ((value - v3)  / (v15 - v3))  * 12;
  if (value <= v50) return 15 + ((value - v15) / (v50 - v15)) * 35;
  if (value <= v85) return 50 + ((value - v50) / (v85 - v50)) * 35;
  if (value <= v97) return 85 + ((value - v85) / (v97 - v85)) * 12;
  return 97;
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
