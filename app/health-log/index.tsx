import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { useHealthNotes, type HealthNoteRow } from '@/hooks/useHealthNotes';

type Category = { id: HealthNoteRow['category']; label: string; icon: string; placeholder: string };

const CATEGORIES: Category[] = [
  { id: 'symptom', label: 'Symptom', icon: 'thermometer-outline', placeholder: 'e.g. Mild fever since this morning, temp 99.4°F' },
  { id: 'behaviour', label: 'Behaviour', icon: 'happy-outline', placeholder: 'e.g. Less playful today, not finishing meals' },
  { id: 'sleep', label: 'Sleep', icon: 'moon-outline', placeholder: 'e.g. Woke up 3 times, total ~7 hrs' },
  { id: 'feeding', label: 'Feeding', icon: 'nutrition-outline', placeholder: 'e.g. Refused solids, only took 200ml milk' },
  { id: 'medication', label: 'Medication', icon: 'medkit-outline', placeholder: 'e.g. Calpol 250mg at 8 AM for fever' },
  { id: 'other', label: 'Other', icon: 'create-outline', placeholder: 'Add any note about today…' },
];

const SEVERITY_LABELS = ['', 'Mild', 'Moderate', 'Concerning', 'Urgent'];

const SEVERITY_COLORS = ['transparent', '#22c55e', '#f59e0b', '#f97316', '#ef4444'];
function severityColor(level: number) {
  return { backgroundColor: SEVERITY_COLORS[level] ?? '#22c55e', borderColor: 'transparent' as const };
}

function formatNow(): string {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `Today, ${now.getDate()} ${months[now.getMonth()]} · ${hour}:${m} ${ampm}`;
}

export default function HealthLogScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<HealthNoteRow['category']>('symptom');
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState(1); // 1–4
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { child } = useChild();
  const { addNote } = useHealthNotes(child?.id ?? null);
  const childName = child?.name ?? 'Child';

  const activeCat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const canSave = note.trim().length >= 3;

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addNote({
        category,
        content: note.trim(),
        severity: ['symptom', 'behaviour', 'other'].includes(category) ? severity : undefined,
      });
      setSaved(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Note Saved</Text>
          <Text style={styles.successSub}>Added to {childName}&apos;s health log.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Health Log</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Timestamp */}
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={14} color={AppColors.onSurfaceVariant} />
          <Text style={styles.timestampText}>{formatNow()}</Text>
        </View>

        {/* Category chips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={active ? AppColors.primary : AppColors.onSurfaceVariant}
                  />
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Note input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Note</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={activeCat.placeholder}
              placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
              multiline
              numberOfLines={5}
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
              autoFocus
            />
          </View>
        </View>

        {/* Severity — only for symptom/behaviour/other */}
        {['symptom', 'behaviour', 'other'].includes(category) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Severity</Text>
            <View style={styles.severityRow}>
              {[1, 2, 3, 4].map((level) => (
                <Pressable
                  key={level}
                  style={[styles.severityDot, severity >= level && severityColor(level)]}
                  onPress={() => setSeverity(level)}
                />
              ))}
              <Text style={styles.severityLabel}>{SEVERITY_LABELS[severity]}</Text>
            </View>
          </View>
        )}

        {/* Attach photo placeholder */}
        <Pressable style={styles.attachRow}>
          <Ionicons name="camera-outline" size={18} color={AppColors.onSurfaceVariant} />
          <Text style={styles.attachText}>Attach photo (optional)</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !canSave && styles.saveBtnDisabled, { opacity: pressed ? 0.88 : 1 }]}
          disabled={!canSave || saving}
          onPress={handleSave}
        >
          <LinearGradient
            colors={canSave ? [AppColors.primary, '#8b3cf7'] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveGrad}
          >
            <Ionicons name="checkmark" size={18} color={canSave ? '#fff' : AppColors.onSurfaceVariant} />
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>Save Note</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 24 },

  timestampRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${AppColors.outlineVariant}15`, borderRadius: 999,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
  },
  timestampText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },

  section: { gap: 10 },
  sectionLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}35`,
  },
  catChipActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}08` },
  catLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurface },
  catLabelActive: { color: AppColors.primary, fontFamily: 'PlusJakartaSans_700Bold' },

  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}30`,
    padding: 14, minHeight: 130,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  input: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15,
    color: AppColors.onSurface, lineHeight: 22, minHeight: 106,
  },

  severityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  severityDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${AppColors.outlineVariant}25`, borderWidth: 1.5, borderColor: 'transparent',
  },
  // severityDotActive is handled by severityColor() function above
  severityLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface, marginLeft: 4 },

  attachRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: `${AppColors.outlineVariant}50`,
    borderRadius: 14, padding: 16,
  },
  attachText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurfaceVariant },

  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20`,
  },
  saveBtn: { borderRadius: 999, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.5 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#fff' },
  saveTextDisabled: { color: AppColors.onSurfaceVariant },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#bbf7d0',
  },
  successTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: AppColors.onSurface },
  successSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant },
});
