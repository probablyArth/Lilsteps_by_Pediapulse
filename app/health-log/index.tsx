import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

import { CategoryChips } from '@/components/health-log/CategoryChips';
import { HEALTH_CATEGORIES, SEVERITY_AWARE_CATEGORIES } from '@/components/health-log/categories';
import { PhotoAttach } from '@/components/health-log/PhotoAttach';
import { SeverityDots } from '@/components/health-log/SeverityDots';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useChild } from '@/context/child';
import { useHealthNotes, type HealthNoteRow } from '@/hooks/useHealthNotes';
import { supabase } from '@/lib/supabase';

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
  const [severity, setSeverity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; mime: string } | null>(null);

  const { child } = useChild();
  const { user } = useAuth();
  const { addNote } = useHealthNotes(child?.id ?? null);
  const childName = child?.name ?? 'Child';

  const activeCat = HEALTH_CATEGORIES.find((c) => c.id === category) ?? HEALTH_CATEGORIES[0];
  const canSave = note.trim().length >= 3;
  const showSeverity = SEVERITY_AWARE_CATEGORIES.includes(category);

  async function uploadPhoto(uri: string, mime: string, userId: string): Promise<string> {
    const res = await fetch(uri);
    const arrayBuffer = await res.arrayBuffer();
    const ext = (mime.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('health-photos')
      .upload(path, arrayBuffer, { contentType: mime, upsert: false });
    if (uploadErr) throw new Error(uploadErr.message);
    return path;
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      let photoPath: string | undefined;
      if (photo && user) {
        photoPath = await uploadPhoto(photo.uri, photo.mime, user.id);
      }
      await addNote({
        category,
        content: note.trim(),
        severity: showSeverity ? severity : undefined,
        photo_url: photoPath,
      });
      setSaved(true);
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (e) {
      Alert.alert('Could not save note', e instanceof Error ? e.message : 'Please try again.');
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color={AppColors.successGreen} />
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
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={14} color={AppColors.onSurfaceVariant} />
          <Text style={styles.timestampText}>{formatNow()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <CategoryChips value={category} onChange={setCategory} />
        </View>

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

        {showSeverity && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Severity</Text>
            <SeverityDots value={severity} onChange={setSeverity} />
          </View>
        )}

        <PhotoAttach uri={photo?.uri ?? null} onChange={setPhoto} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !canSave && styles.saveBtnDisabled, { opacity: pressed ? 0.88 : 1 }]}
          disabled={!canSave || saving}
          onPress={handleSave}
        >
          <LinearGradient
            colors={canSave ? [AppColors.primary, AppColors.gradientEnd] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveGrad}
          >
            <Ionicons name="checkmark" size={18} color={canSave ? AppColors.onPrimary : AppColors.onSurfaceVariant} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 24 },

  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${AppColors.outlineVariant}15`,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timestampText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.onSurfaceVariant },

  section: { gap: 10 },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}30`,
    padding: 14,
    minHeight: 130,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: AppColors.onSurface,
    lineHeight: 22,
    minHeight: 106,
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: `${AppColors.outlineVariant}20`,
  },
  saveBtn: { borderRadius: 999, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.5 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.onPrimary },
  saveTextDisabled: { color: AppColors.onSurfaceVariant },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.successGreenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.successGreenBright,
  },
  successTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: AppColors.onSurface },
  successSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant },
});
