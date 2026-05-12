import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors } from '@/constants/theme';

const FEVER_LEVELS = [
  { max: 37.4, label: 'Normal',     color: AppColors.successGreen },
  { max: 37.9, label: 'Low Grade',  color: AppColors.warningAmber },
  { max: 38.9, label: 'Fever',      color: AppColors.orange },
  { max: 99,   label: 'High Fever', color: AppColors.errorRed },
];

function getFeverLevel(temp: number) {
  return FEVER_LEVELS.find((l) => temp <= l.max) ?? FEVER_LEVELS[3];
}

export type TempUnit = 'C' | 'F';

export interface FeverInputProps {
  value: string;
  unit: TempUnit;
  onValueChange: (v: string) => void;
  onUnitChange: (u: TempUnit) => void;
}

export function FeverInput({ value, unit, onValueChange, onUnitChange }: FeverInputProps) {
  const num = parseFloat(value);
  const tempInC = !isNaN(num) ? (unit === 'F' ? ((num - 32) * 5) / 9 : num) : null;
  const level = tempInC !== null ? getFeverLevel(tempInC) : null;
  const barWidth = tempInC !== null ? Math.min(Math.max((tempInC - 36) / 4, 0), 1) : 0;

  return (
    <Card style={styles.card}>
      <Card.Body style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Temperature</Text>
          <View style={styles.toggle}>
            <Pressable
              style={[styles.unit, unit === 'C' && styles.unitActive]}
              onPress={() => onUnitChange('C')}
            >
              <Text style={[styles.unitText, unit === 'C' && styles.unitTextActive]}>°C</Text>
            </Pressable>
            <Pressable
              style={[styles.unit, unit === 'F' && styles.unitActive]}
              onPress={() => onUnitChange('F')}
            >
              <Text style={[styles.unitText, unit === 'F' && styles.unitTextActive]}>°F</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onValueChange}
            keyboardType="decimal-pad"
            placeholder={unit === 'C' ? '38.5' : '101.3'}
            placeholderTextColor={`${AppColors.primary}50`}
          />
          {level && (
            <View style={styles.severity}>
              <Text style={[styles.severityLabel, { color: level.color }]}>
                {level.label}
              </Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round(barWidth * 100)}%` as any, backgroundColor: level.color },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </Card.Body>
    </Card>
  );
}

export function buildFeverComplaint(value: string, unit: TempUnit): string | null {
  if (!value) return null;
  return `Fever (temperature: ${value}°${unit})`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${AppColors.primary}20`,
  },
  body: { padding: 18, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface },
  toggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceContainerHigh,
    borderRadius: 999,
    padding: 3,
  },
  unit: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  unitActive: { backgroundColor: AppColors.surfaceContainerLowest },
  unitText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurfaceVariant },
  unitTextActive: { color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    color: AppColors.primary,
    borderWidth: 1.5,
    borderColor: `${AppColors.primary}15`,
  },
  severity: { gap: 6 },
  severityLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bar: {
    width: 88,
    height: 6,
    borderRadius: 999,
    backgroundColor: AppColors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 999 },
});
