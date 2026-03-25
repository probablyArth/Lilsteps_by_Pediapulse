import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_W - 48 - 12) / 2; // 2 cols, 24px sides, 12px gap

// Symptom tiles — same set but bracket-filtered
interface SymptomTile {
  key: string;
  label: string;
  sub: string;
  icon: string;
}

const BASE_TILES: SymptomTile[] = [
  { key: 'Fever', label: 'Fever', sub: 'High temperature, chills', icon: 'thermometer-outline' },
  { key: 'Sleep', label: 'Sleep', sub: 'Restless, waking up', icon: 'moon-outline' },
  { key: 'Appetite', label: 'Appetite', sub: 'Low intake, refusal', icon: 'nutrition-outline' },
  { key: 'Energy', label: 'Energy', sub: 'Lethargic, quiet', icon: 'flash-outline' },
  { key: 'Cough', label: 'Cough', sub: 'Dry or chesty', icon: 'medical-outline' },
  { key: 'Skin', label: 'Skin', sub: 'Rash, redness, spots', icon: 'body-outline' },
  { key: 'Stomach', label: 'Stomach', sub: 'Pain, nausea, vomiting', icon: 'sad-outline' },
  { key: 'Breathing', label: 'Breathing', sub: 'Fast or laboured', icon: 'pulse-outline' },
];

const BRACKET_TILES: Record<string, string[]> = {
  NEWBORN: ['Fever', 'Appetite', 'Breathing', 'Skin', 'Sleep', 'Energy'],
  EARLY_INFANT: ['Fever', 'Appetite', 'Cough', 'Skin', 'Sleep', 'Stomach'],
  INFANT: ['Fever', 'Appetite', 'Cough', 'Skin', 'Sleep', 'Stomach'],
  TODDLER_EARLY: ['Fever', 'Appetite', 'Cough', 'Stomach', 'Sleep', 'Skin'],
  TODDLER: ['Fever', 'Stomach', 'Cough', 'Skin', 'Appetite', 'Sleep'],
  PRESCHOOL: ['Fever', 'Stomach', 'Cough', 'Sleep', 'Appetite', 'Energy'],
  SCHOOL_EARLY: ['Fever', 'Stomach', 'Energy', 'Sleep', 'Cough', 'Skin'],
  SCHOOL_MID: ['Fever', 'Stomach', 'Energy', 'Sleep', 'Cough', 'Skin'],
  ADOLESCENT: ['Energy', 'Stomach', 'Fever', 'Sleep', 'Cough', 'Skin'],
};

function getTiles(bracket: string | null): SymptomTile[] {
  const keys = BRACKET_TILES[bracket ?? 'TODDLER'] ?? BRACKET_TILES.TODDLER;
  return keys.map((k) => BASE_TILES.find((t) => t.key === k)!).filter(Boolean);
}

const FEVER_LEVELS = [
  { max: 37.4, label: 'Normal', color: AppColors.successGreen },
  { max: 37.9, label: 'Low Grade', color: AppColors.warningAmber },
  { max: 38.9, label: 'Fever', color: AppColors.orange },
  { max: 99, label: 'High Fever', color: AppColors.errorRed },
];

function getFeverLevel(temp: number) {
  return FEVER_LEVELS.find((l) => temp <= l.max) ?? FEVER_LEVELS[3];
}

export default function CheckinEntryScreen() {
  const insets = useSafeAreaInsets();
  const { child, bracket } = useChild();
  const childName = child?.name ?? 'Child';

  const tiles = getTiles(bracket);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tempStr, setTempStr] = useState('');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  const hasFever = selected.has('Fever');
  const tempNum = parseFloat(tempStr);
  const tempInC = !isNaN(tempNum)
    ? tempUnit === 'F' ? (tempNum - 32) * 5 / 9 : tempNum
    : null;
  const feverLevel = tempInC !== null ? getFeverLevel(tempInC) : null;
  const feverBarWidth = tempInC !== null ? Math.min(Math.max((tempInC - 36) / 4, 0), 1) : 0;

  const canContinue = selected.size > 0;

  function toggleTile(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function buildComplaint(): string {
    const parts = Array.from(selected);
    if (hasFever && tempStr) {
      const idx = parts.indexOf('Fever');
      parts[idx] = `Fever (temperature: ${tempStr}°${tempUnit})`;
    }
    return parts.join(', ');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <View style={styles.headerCenter}>
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBadge}
          >
            <Ionicons name="sparkles" size={13} color={AppColors.onPrimary} />
          </LinearGradient>
          <Text style={styles.headerTitle}>LilSteps AI</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={13} color={AppColors.primary} />
            <Text style={styles.aiBadgeText}>AI Health Assistant</Text>
          </View>
          <Text style={styles.heroTitle}>How is {childName} feeling today?</Text>
          <Text style={styles.heroSub}>
            Select the areas that concern you to begin an intelligent health triage.
          </Text>
        </View>

        {/* Bento grid */}
        <View style={styles.grid}>
          {tiles.map((tile) => {
            const active = selected.has(tile.key);
            return (
              <Pressable
                key={tile.key}
                style={({ pressed }) => [
                  styles.tile,
                  active && styles.tileActive,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => toggleTile(tile.key)}
              >
                {/* Active checkmark badge */}
                {active && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={AppColors.onPrimary} />
                  </View>
                )}

                {/* Icon */}
                <View style={[styles.tileIcon, active && styles.tileIconActive]}>
                  <Ionicons
                    name={tile.icon as any}
                    size={22}
                    color={active ? AppColors.onPrimary : AppColors.primary}
                  />
                </View>

                {/* Text */}
                <View style={styles.tileText}>
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
                    {tile.label}
                  </Text>
                  <Text style={styles.tileSub} numberOfLines={1}>{tile.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Contextual: Temperature input when Fever is selected */}
        {hasFever && (
          <View style={styles.tempCard}>
            <View style={styles.tempCardHeader}>
              <Text style={styles.tempCardTitle}>Enter Temperature</Text>
              {/* °C / °F toggle */}
              <View style={styles.unitToggle}>
                <Pressable
                  style={[styles.unitBtn, tempUnit === 'C' && styles.unitBtnActive]}
                  onPress={() => setTempUnit('C')}
                >
                  <Text style={[styles.unitBtnText, tempUnit === 'C' && styles.unitBtnTextActive]}>°C</Text>
                </Pressable>
                <Pressable
                  style={[styles.unitBtn, tempUnit === 'F' && styles.unitBtnActive]}
                  onPress={() => setTempUnit('F')}
                >
                  <Text style={[styles.unitBtnText, tempUnit === 'F' && styles.unitBtnTextActive]}>°F</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tempRow}>
              <TextInput
                style={styles.tempInput}
                value={tempStr}
                onChangeText={setTempStr}
                keyboardType="decimal-pad"
                placeholder={tempUnit === 'C' ? '38.5' : '101.3'}
                placeholderTextColor={`${AppColors.primary}50`}
              />
              {feverLevel && (
                <View style={styles.tempSeverity}>
                  <Text style={[styles.tempSeverityLabel, { color: feverLevel.color }]}>
                    {feverLevel.label}
                  </Text>
                  <View style={styles.tempBar}>
                    <View
                      style={[
                        styles.tempBarFill,
                        {
                          width: `${Math.round(feverBarWidth * 100)}%` as any,
                          backgroundColor: feverLevel.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          LilSteps AI provides guidance, not diagnosis. In an emergency, contact local medical services immediately.
        </Text>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, !canContinue && styles.ctaBtnDisabled, { opacity: pressed ? 0.9 : 1 }]}
          disabled={!canContinue}
          onPress={() => router.push({ pathname: '/checkin/chat', params: { complaint: buildComplaint() } })}
        >
          <LinearGradient
            colors={canContinue ? [AppColors.primary, AppColors.gradientEnd] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Ionicons
              name="analytics-outline"
              size={20}
              color={canContinue ? AppColors.onPrimary : AppColors.onSurfaceVariant}
            />
            <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
              Analyze with AI
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: `${AppColors.outlineVariant}15`,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17,
    color: AppColors.primary, letterSpacing: -0.2,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },

  // Hero
  hero: { gap: 10 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: `${AppColors.primary}15`,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  aiBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.primary },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28,
    color: AppColors.onSurface, letterSpacing: -0.6, lineHeight: 36,
  },
  heroSub: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurfaceVariant, lineHeight: 20,
  },

  // Bento grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}20`,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tileActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.surfaceContainerLowest,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: AppColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  tileIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: AppColors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  tileIconActive: {
    backgroundColor: AppColors.primary,
  },
  tileText: { gap: 3 },
  tileLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  tileLabelActive: { color: AppColors.primary },
  tileSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },

  // Temperature card
  tempCard: {
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 20, padding: 20, gap: 16,
    borderWidth: 1, borderColor: `${AppColors.primary}15`,
  },
  tempCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tempCardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onSurface },
  unitToggle: {
    flexDirection: 'row', backgroundColor: AppColors.surfaceContainerHigh,
    borderRadius: 999, padding: 3,
  },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  unitBtnActive: { backgroundColor: AppColors.surfaceContainerLowest },
  unitBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurfaceVariant },
  unitBtnTextActive: { color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' },
  tempRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  tempInput: {
    flex: 1, height: 60, backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 14, paddingHorizontal: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: AppColors.primary,
    borderWidth: 1.5, borderColor: `${AppColors.primary}20`,
  },
  tempSeverity: { gap: 6 },
  tempSeverityLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  tempBar: {
    width: 88, height: 6, borderRadius: 999,
    backgroundColor: AppColors.surfaceContainerHighest, overflow: 'hidden',
  },
  tempBarFill: { height: 6, borderRadius: 999 },

  disclaimer: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11,
    color: AppColors.onSurfaceVariant, textAlign: 'center',
    lineHeight: 16, paddingHorizontal: 8,
  },

  // Bottom CTA
  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20`,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtn: { borderRadius: 999, overflow: 'hidden' },
  ctaBtnDisabled: {},
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17 },
  ctaText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: AppColors.onPrimary },
  ctaTextDisabled: { color: AppColors.onSurfaceVariant },
});
