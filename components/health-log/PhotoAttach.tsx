import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface PhotoAttachProps {
  uri: string | null;
  onChange: (next: { uri: string; mime: string } | null) => void;
}

export function PhotoAttach({ uri, onChange }: PhotoAttachProps) {
  async function handlePick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    onChange({ uri: asset.uri, mime: asset.mimeType ?? 'image/jpeg' });
  }

  if (uri) {
    return (
      <View style={styles.previewRow}>
        <Image source={{ uri }} style={styles.preview} contentFit="cover" />
        <View style={styles.meta}>
          <Text style={styles.metaText}>Photo attached</Text>
          <Text style={styles.metaSub}>Will upload when you save</Text>
        </View>
        <Pressable style={styles.remove} onPress={() => onChange(null)} hitSlop={8}>
          <Ionicons name="close" size={16} color={AppColors.onSurface} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.attachRow} onPress={handlePick}>
      <Ionicons name="camera-outline" size={18} color={AppColors.onSurfaceVariant} />
      <Text style={styles.attachText}>Attach photo (optional)</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${AppColors.outlineVariant}50`,
    borderRadius: 14,
    padding: 16,
  },
  attachText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurfaceVariant },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}30`,
    borderRadius: 14,
    padding: 10,
  },
  preview: { width: 56, height: 56, borderRadius: 10, backgroundColor: AppColors.surfaceContainerHigh },
  meta: { flex: 1, gap: 2 },
  metaText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  metaSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
  remove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${AppColors.outlineVariant}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
