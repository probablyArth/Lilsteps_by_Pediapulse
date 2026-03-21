import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

// Bracket-specific complaint chips — shown as quick-select shortcuts
const COMPLAINT_CHIPS: Record<string, string[]> = {
  NEWBORN: ['Not feeding well', 'Unusual crying', 'Skin colour change', 'Breathing concerns'],
  EARLY_INFANT: ['Not feeding well', 'High temperature', 'Persistent crying', 'Vomiting'],
  INFANT: ['High fever', 'Not eating', 'Loose stools', 'Ear pain', 'Rash'],
  TODDLER_EARLY: ['Fever', 'Not eating', 'Stomach pain', 'Runny nose', 'Rash'],
  TODDLER: ['Fever', 'Stomach pain', 'Vomiting', 'Cough', 'Rash', 'Not sleeping'],
  PRESCHOOL: ['Fever', 'Stomach pain', 'Sore throat', 'Cough', 'Headache', 'Rash'],
  SCHOOL_EARLY: ['Fever', 'Stomach pain', 'Headache', 'Sore throat', 'Tiredness', 'Rash'],
  SCHOOL_MID: ['Headache', 'Stomach pain', 'Fever', 'Sore throat', 'Fatigue', 'Back pain'],
  ADOLESCENT: ['Headache', 'Fatigue', 'Stomach pain', 'Sore throat', 'Anxiety', 'Back pain'],
};

export default function CheckinEntryScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');

  const { child, bracket } = useChild();
  const childName = child?.name ?? 'Child';
  const chips = COMPLAINT_CHIPS[bracket ?? 'TODDLER'] ?? COMPLAINT_CHIPS.TODDLER;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  function handleChip(chip: string) {
    setText((prev) => {
      if (prev.trim()) return prev.trimEnd() + ', ' + chip;
      return chip;
    });
  }

  const canContinue = text.trim().length >= 3;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Health Check-in</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What&apos;s bothering{'\n'}{childName} today?</Text>
          <Text style={styles.subtitle}>Describe the main symptom or concern — the AI will ask follow-up questions.</Text>
        </View>

        {/* Complaint chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>Quick select</Text>
          <View style={styles.chipsWrap}>
            {chips.map((chip) => {
              const active = text.toLowerCase().includes(chip.toLowerCase());
              return (
                <Pressable
                  key={chip}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => handleChip(chip)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Text input */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={`e.g. ${childName} has had a high fever since yesterday morning...`}
            placeholderTextColor={`${AppColors.onSurfaceVariant}70`}
            multiline
            numberOfLines={4}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />
          {text.length > 0 && (
            <Pressable style={styles.clearBtn} onPress={() => setText('')}>
              <Ionicons name="close-circle" size={18} color={`${AppColors.onSurfaceVariant}60`} />
            </Pressable>
          )}
        </View>

        <Text style={styles.hint}>
          <Ionicons name="lock-closed-outline" size={11} color={AppColors.onSurfaceVariant} />
          {'  '}Your response is private and only shared with the doctor.
        </Text>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, !canContinue && styles.ctaBtnDisabled, { opacity: pressed ? 0.88 : 1 }]}
          disabled={!canContinue}
          onPress={() => router.push({ pathname: '/checkin/chat', params: { complaint: text.trim() } })}
        >
          <LinearGradient
            colors={canContinue ? [AppColors.primary, '#8b3cf7'] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>Start Check-in</Text>
            <Ionicons name="arrow-forward" size={18} color={canContinue ? '#fff' : AppColors.onSurfaceVariant} />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 24 },

  titleBlock: { gap: 8 },
  title: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: AppColors.onSurface, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant, lineHeight: 20 },

  chipsSection: { gap: 10 },
  chipsLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}40`,
  },
  chipActive: { backgroundColor: `${AppColors.primary}12`, borderColor: AppColors.primary },
  chipText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurface },
  chipTextActive: { color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' },

  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30`,
    padding: 14, minHeight: 120,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  input: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15,
    color: AppColors.onSurface, lineHeight: 22, minHeight: 96,
  },
  clearBtn: { position: 'absolute', top: 10, right: 10 },

  hint: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant, textAlign: 'center' },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20`,
  },
  ctaBtn: { borderRadius: 999, overflow: 'hidden' },
  ctaBtnDisabled: {},
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  ctaText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
  ctaTextDisabled: { color: AppColors.onSurfaceVariant },
});
