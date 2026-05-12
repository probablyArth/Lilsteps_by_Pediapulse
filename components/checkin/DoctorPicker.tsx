import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { DoctorRow } from '@/hooks/useDoctors';

export interface DoctorPickerProps {
  doctors: DoctorRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DoctorPicker({ doctors, selectedId, onSelect }: DoctorPickerProps) {
  return (
    <View style={styles.list}>
      {doctors.map((doc) => {
        const active = selectedId === doc.id;
        return (
          <Pressable key={doc.id} onPress={() => onSelect(doc.id)}>
            <Card style={[styles.card, active && styles.cardActive]}>
              <Card.Body style={styles.body}>
                <View style={[styles.avatar, active && styles.avatarActive]}>
                  <Text style={[styles.avatarText, active && styles.avatarTextActive]}>
                    {doc.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.spec} numberOfLines={1}>{doc.specialisation}</Text>
                </View>
                {active && (
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={14} color={AppColors.onPrimary} />
                  </View>
                )}
              </Card.Body>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  cardActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}04` },
  body: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: { backgroundColor: AppColors.primary },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: AppColors.primary },
  avatarTextActive: { color: AppColors.onPrimary },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.onSurface },
  spec: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
