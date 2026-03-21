import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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

import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useDocuments, type DocumentRow } from '@/hooks/useDocuments';

type DocCategory = DocumentRow['category'];

const CATEGORIES: { id: DocCategory; label: string; icon: string }[] = [
  { id: 'prescription', label: 'Prescription', icon: 'document-text-outline' },
  { id: 'report', label: 'Report', icon: 'analytics-outline' },
  { id: 'lab_test', label: 'Lab Test', icon: 'flask-outline' },
  { id: 'visit_history', label: 'Visit History', icon: 'time-outline' },
  { id: 'other', label: 'Other', icon: 'create-outline' },
];

export default function UploadDocumentScreen() {
  const insets = useSafeAreaInsets();
  const { child } = useChild();
  const { uploadDocument } = useDocuments(child?.id ?? null);

  const [category, setCategory] = useState<DocCategory>('prescription');
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSave = title.trim().length >= 2 && fileUri.length > 0;

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setFileName(asset.name);
      setFileUri(asset.uri);
      setFileType(asset.mimeType ?? 'application/octet-stream');
      setFileSize(asset.size ?? 0);
      if (!title.trim()) {
        setTitle(asset.name.replace(/\.[^.]+$/, ''));
      }
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop() ?? 'photo.jpg';
      setFileName(name);
      setFileUri(asset.uri);
      setFileType(asset.mimeType ?? 'image/jpeg');
      setFileSize(asset.fileSize ?? 0);
      if (!title.trim()) {
        setTitle(name.replace(/\.[^.]+$/, ''));
      }
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop() ?? 'photo.jpg';
      setFileName(name);
      setFileUri(asset.uri);
      setFileType(asset.mimeType ?? 'image/jpeg');
      setFileSize(asset.fileSize ?? 0);
    }
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await uploadDocument({
        title: title.trim(),
        category,
        file_url: fileUri,
        file_type: fileType.includes('pdf') ? 'pdf' : 'image',
        file_size: fileSize,
        doctor_name: doctorName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => router.back(), 1500);
    } catch {
      Alert.alert('Error', 'Failed to save document. Please try again.');
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
          <Text style={styles.successTitle}>Document Saved</Text>
          <Text style={styles.successSub}>Added to health records.</Text>
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
        <Text style={styles.headerTitle}>Upload Document</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* File picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select File</Text>
          {fileUri ? (
            <View style={styles.fileCard}>
              <Ionicons
                name={fileType.includes('pdf') ? 'document-text' : 'image'}
                size={28}
                color={AppColors.primary}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                <Text style={styles.fileSize}>
                  {fileSize > 0 ? `${(fileSize / 1024).toFixed(0)} KB` : fileType}
                </Text>
              </View>
              <Pressable onPress={() => { setFileUri(''); setFileName(''); }}>
                <Ionicons name="close-circle" size={22} color={AppColors.onSurfaceVariant} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.pickerRow}>
              <Pressable style={styles.pickerBtn} onPress={pickDocument}>
                <Ionicons name="document-outline" size={24} color={AppColors.primary} />
                <Text style={styles.pickerLabel}>File</Text>
              </Pressable>
              <Pressable style={styles.pickerBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color={AppColors.secondary} />
                <Text style={styles.pickerLabel}>Gallery</Text>
              </Pressable>
              <Pressable style={styles.pickerBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color={AppColors.tertiary} />
                <Text style={styles.pickerLabel}>Camera</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Category */}
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

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputSingle}
              placeholder="e.g. Blood Test Results"
              placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Doctor name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Doctor (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputSingle}
              placeholder="e.g. Dr. Sarah Miller"
              placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputMulti}
              placeholder="Add any notes about this document..."
              placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
        </View>
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
            <Ionicons name="cloud-upload-outline" size={18} color={canSave ? '#fff' : AppColors.onSurfaceVariant} />
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              {saving ? 'Saving...' : 'Upload Document'}
            </Text>
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

  section: { gap: 10 },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  pickerRow: { flexDirection: 'row', gap: 12 },
  pickerBtn: {
    flex: 1, alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: `${AppColors.outlineVariant}50`,
    paddingVertical: 24,
  },
  pickerLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.onSurfaceVariant },

  fileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: `${AppColors.primary}30`,
  },
  fileInfo: { flex: 1, gap: 2 },
  fileName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.onSurface },
  fileSize: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },

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
    padding: 14,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputSingle: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, color: AppColors.onSurface, lineHeight: 22,
  },
  inputMulti: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, color: AppColors.onSurface, lineHeight: 22,
    minHeight: 70,
  },

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
