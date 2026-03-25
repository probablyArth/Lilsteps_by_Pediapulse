/**
 * Describe Your Issue — Step 1 of booking
 *
 * User describes their concern via chips + free text.
 * "Skip" option takes them directly to slot selection.
 * Passing: doctorId → slots screen
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

// Bracket-specific quick complaint chips
const COMPLAINT_CHIPS: Record<string, string[]> = {
  NEWBORN:      ['Feeding issues', 'Jaundice concern', 'Crying / Colic', 'Rash / Skin', 'Breathing'],
  EARLY_INFANT: ['Feeding issues', 'Vomiting', 'Rash', 'Fever', 'Sleep trouble'],
  INFANT:       ['Fever', 'Cold / Cough', 'Rash', 'Diarrhea', 'Teething pain'],
  TODDLER_EARLY:['Fever', 'Cold / Cough', 'Ear pain', 'Not eating well', 'Rash'],
  TODDLER:      ['Fever', 'Cold', 'Tummy ache', 'Rash', 'Not eating', 'Sleep issues'],
  PRESCHOOL:    ['Fever', 'Cold', 'Tummy ache', 'Rash', 'Throat pain', 'Eye issue'],
  SCHOOL_EARLY: ['Fever', 'Headache', 'Cold', 'Tummy pain', 'Eye/Ear issue', 'Rash'],
  SCHOOL_MID:   ['Headache', 'Fever', 'Stomach pain', 'Skin concern', 'Fatigue', 'Anxiety'],
  ADOLESCENT:   ['Fatigue', 'Headache', 'Skin/Acne', 'Mental health', 'Joint pain', 'Sleep'],
};

const DEFAULT_CHIPS = ['Fever', 'Cold / Cough', 'Tummy ache', 'Rash', 'Other'];

export default function DescribeScreen() {
  const insets = useSafeAreaInsets();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const { bracket } = useChild();
  const chips = COMPLAINT_CHIPS[bracket ?? ''] ?? DEFAULT_CHIPS;

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const inputRef = useRef<TextInput>(null);

  function toggleChip(chip: string) {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }

  const canContinue = selectedChips.length > 0 || description.trim().length >= 3;
  const summaryText = [
    ...selectedChips,
    description.trim() ? description.trim() : null,
  ]
    .filter(Boolean)
    .join(', ');

  function goToSlots(issue?: string) {
    const encoded = issue ? encodeURIComponent(issue) : '';
    router.push(`/consult/slots?doctorId=${doctorId}&issue=${encoded}`);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Describe Issue</Text>
        <Pressable style={styles.skipBtn} onPress={() => goToSlots()}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward-outline" size={14} color={AppColors.primary} />
        </Pressable>
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, s === 1 && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Prompt */}
        <View style={styles.promptSection}>
          <View style={styles.aiChip}>
            <Ionicons name="sparkles" size={14} color={AppColors.primary} />
            <Text style={styles.aiChipText}>AI-assisted triage</Text>
          </View>
          <Text style={styles.promptTitle}>What's concerning you today?</Text>
          <Text style={styles.promptSub}>
            Select all that apply or describe in your own words. Our AI will help the doctor prepare.
          </Text>
        </View>

        {/* Quick chips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Common concerns</Text>
          <View style={styles.chipWrap}>
            {chips.map((chip) => {
              const active = selectedChips.includes(chip);
              return (
                <Pressable
                  key={chip}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleChip(chip)}
                >
                  {active && <Ionicons name="checkmark" size={13} color={AppColors.onPrimary} />}
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Free text */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add more details (optional)</Text>
          <Pressable
            style={styles.textAreaWrap}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            <TextInput
              ref={inputRef}
              style={styles.textArea}
              placeholder="E.g. fever since yesterday evening, around 101°F, also has runny nose…"
              placeholderTextColor={`${AppColors.onSurfaceVariant}80`}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </Pressable>
        </View>

        {/* Urgency note */}
        <View style={styles.urgentCard}>
          <Ionicons name="warning-outline" size={18} color={AppColors.tertiary} />
          <View style={styles.urgentText}>
            <Text style={styles.urgentTitle}>In case of emergency</Text>
            <Text style={styles.urgentBody}>
              If your child has difficulty breathing, seizures, or is unresponsive — call 112 immediately.
            </Text>
          </View>
        </View>

        {/* Skip CTA */}
        <Pressable style={styles.skipCard} onPress={() => goToSlots()}>
          <Ionicons name="flash-outline" size={18} color={AppColors.onSurfaceVariant} />
          <View style={{ flex: 1 }}>
            <Text style={styles.skipCardTitle}>Talk to doctor directly</Text>
            <Text style={styles.skipCardSub}>Skip AI triage and book a slot right now</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={`${AppColors.onSurfaceVariant}60`} />
        </Pressable>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, !canContinue && styles.continueBtnDisabled, { opacity: pressed ? 0.87 : 1 }]}
          disabled={!canContinue}
          onPress={() => goToSlots(summaryText)}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueBtnGrad}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
          </LinearGradient>
        </Pressable>
        {!canContinue && (
          <Text style={styles.hint}>Select at least one concern or describe the issue</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: `${AppColors.primary}40`,
  },
  skipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.primary },

  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: `${AppColors.outlineVariant}30` },
  stepDotActive: { backgroundColor: AppColors.primary },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },

  promptSection: { gap: 10 },
  aiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: `${AppColors.primary}12`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  aiChipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.primary },
  promptTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: AppColors.onSurface, letterSpacing: -0.5 },
  promptSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant, lineHeight: 20 },

  section: { gap: 10 },
  sectionLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurfaceVariant },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}40`,
  },
  chipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  chipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  chipTextActive: { color: AppColors.onPrimary },

  textAreaWrap: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30`, padding: 14, minHeight: 100,
  },
  textArea: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurface, lineHeight: 20 },

  urgentCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: `${AppColors.tertiaryContainer}20`,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${AppColors.tertiary}15`,
  },
  urgentText: { flex: 1, gap: 3 },
  urgentTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  urgentBody: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, lineHeight: 18 },

  skipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: AppColors.surfaceContainerLow, borderRadius: 16, padding: 16,
  },
  skipCardTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  skipCardSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, marginTop: 2 },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}15`, gap: 8,
  },
  continueBtn: { borderRadius: 999, overflow: 'hidden' },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  continueBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onPrimary },
  hint: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, textAlign: 'center' },
});
