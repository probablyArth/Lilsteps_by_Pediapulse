import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHECKIN_HEADER_HEIGHT, CheckinHeader } from '@/components/checkin/CheckinHeader';
import { FeverInput, type TempUnit, buildFeverComplaint } from '@/components/checkin/FeverInput';
import { SymptomTile } from '@/components/checkin/SymptomTile';
import { getTiles } from '@/components/checkin/symptomTiles';
import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_W - 40 - 12) / 2;

export default function CheckinEntryScreen() {
  const insets = useSafeAreaInsets();
  const { child, bracket } = useChild();
  const childName = child?.name ?? 'Child';

  const tiles = getTiles(bracket);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tempStr, setTempStr] = useState('');
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');

  const hasFever = selected.has('Fever');
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
    if (hasFever) {
      const feverWithTemp = buildFeverComplaint(tempStr, tempUnit);
      if (feverWithTemp) {
        const idx = parts.indexOf('Fever');
        parts[idx] = feverWithTemp;
      }
    }
    return parts.join(', ');
  }

  return (
    <View style={styles.root}>
      <CheckinHeader onBack={() => router.back()} showStatusDot />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + CHECKIN_HEADER_HEIGHT, paddingBottom: 120 + insets.bottom },
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
          {tiles.map((tile) => (
            <SymptomTile
              key={tile.key}
              tile={tile}
              active={selected.has(tile.key)}
              size={TILE_SIZE}
              onToggle={toggleTile}
            />
          ))}
        </View>

        {hasFever && (
          <FeverInput
            value={tempStr}
            unit={tempUnit}
            onValueChange={setTempStr}
            onUnitChange={setTempUnit}
          />
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
              colors={
                canContinue
                  ? [AppColors.primary, AppColors.gradientEnd]
                  : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]
              }
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
  scroll: { paddingHorizontal: 20, gap: 24 },

  hero: { gap: 10 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: `${AppColors.primary}12`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.primary },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    color: AppColors.onSurface,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heroSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    lineHeight: 20,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  disclaimer: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  ctaBtn: { borderRadius: 999, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
  },
  ctaText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: AppColors.onPrimary },
  ctaTextDisabled: { color: AppColors.onSurfaceVariant },
});
