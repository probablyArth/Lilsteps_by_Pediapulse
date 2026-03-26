import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Card } from 'heroui-native';
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
const TILE_SIZE = (SCREEN_W - 40 - 12) / 2;

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

const HEADER_HEIGHT = 70;

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
    <View style={styles.root}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <LinearGradient
          colors={[
            AppColors.surface,
            AppColors.surface,
            `${AppColors.surface}E8`,
            `${AppColors.surface}B0`,
            `${AppColors.surface}60`,
            `${AppColors.surface}20`,
            `${AppColors.surface}00`,
          ]}
          locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.header} pointerEvents="box-none">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={AppColors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>LilSteps AI</Text>
          <View style={styles.statusDot} />
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: 120 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.grid}>
          {tiles.map((tile) => {
            const active = selected.has(tile.key);
            return (
              <Pressable
                key={tile.key}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => toggleTile(tile.key)}
              >
                <Card style={[styles.tile, active && styles.tileActive]}>
                  <Card.Body style={styles.tileBody}>
                    {active && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color={AppColors.onPrimary} />
                      </View>
                    )}
                    <View style={[styles.tileIcon, active && styles.tileIconActive]}>
                      <Ionicons
                        name={tile.icon as any}
                        size={22}
                        color={active ? AppColors.onPrimary : AppColors.primary}
                      />
                    </View>
                    <View style={styles.tileText}>
                      <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
                        {tile.label}
                      </Text>
                      <Text style={styles.tileSub} numberOfLines={1}>{tile.sub}</Text>
                    </View>
                  </Card.Body>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {hasFever && (
          <Card style={styles.tempCard}>
            <Card.Body style={styles.tempCardBody}>
              <View style={styles.tempCardHeader}>
                <Text style={styles.tempCardTitle}>Enter Temperature</Text>
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
            </Card.Body>
          </Card>
        )}

        <Text style={styles.disclaimer}>
          LilSteps AI provides guidance, not diagnosis. In an emergency, contact local medical services immediately.
        </Text>
      </ScrollView>

      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
        <LinearGradient
          colors={[
            `${AppColors.surface}00`,
            `${AppColors.surface}20`,
            `${AppColors.surface}60`,
            `${AppColors.surface}B0`,
            `${AppColors.surface}E8`,
            AppColors.surface,
            AppColors.surface,
          ]}
          locations={[0, 0.1, 0.22, 0.35, 0.5, 0.65, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { opacity: pressed && canContinue ? 0.9 : 1 }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 20,
    gap: 6,
  },
  backBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 17,
    color: AppColors.onSurface,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: AppColors.successGreen,
  },
  headerSpacer: { flex: 1 },

  scroll: { paddingHorizontal: 20, gap: 24 },

  hero: { gap: 10 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: `${AppColors.primary}12`,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  aiBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.primary },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26,
    color: AppColors.onSurface, letterSpacing: -0.6, lineHeight: 34,
  },
  heroSub: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurfaceVariant, lineHeight: 20,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: TILE_SIZE,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  tileActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}04`,
  },
  tileBody: {
    padding: 16,
    height: TILE_SIZE - 3,
    justifyContent: 'space-between',
  },
  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: AppColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  tileIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: `${AppColors.primary}12`,
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

  tempCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1, borderColor: `${AppColors.primary}20`,
  },
  tempCardBody: {
    padding: 18, gap: 16,
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
    flex: 1, height: 56, backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 14, paddingHorizontal: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: AppColors.primary,
    borderWidth: 1.5, borderColor: `${AppColors.primary}15`,
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

  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footer: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  ctaBtn: { borderRadius: 999, overflow: 'hidden' },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17 },
  ctaText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: AppColors.onPrimary },
  ctaTextDisabled: { color: AppColors.onSurfaceVariant },
});
