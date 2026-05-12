import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface ConsultHistoryItemProps {
  id: string;
  createdAt: string; // ISO datetime
  doctorName: string;
  chiefComplaint: string | null;
  outcome: string | null;
  onPress: (id: string) => void;
}

export function ConsultHistoryItem({
  id,
  createdAt,
  doctorName,
  chiefComplaint,
  outcome,
  onPress,
}: ConsultHistoryItemProps) {
  const d = new Date(createdAt);

  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      onPress={() => onPress(id)}
    >
      <Card style={styles.card}>
        <Card.Body style={styles.body}>
          <View style={styles.left}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{d.getDate()}</Text>
              <Text style={styles.dateMonth}>{d.toLocaleDateString('en-US', { month: 'short' })}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.complaint}>{chiefComplaint ?? 'Consultation'}</Text>
              <Text style={styles.outcome} numberOfLines={1}>{outcome ?? ''}</Text>
              <View style={styles.doctorRow}>
                <Ionicons name="person-outline" size={12} color={AppColors.primary} />
                <Text style={styles.doctor}>{doctorName}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={AppColors.outlineVariant} />
        </Card.Body>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: AppColors.surfaceContainerLowest, borderRadius: 14 },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dateBadge: {
    backgroundColor: `${AppColors.primary}08`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 44,
  },
  dateDay: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: AppColors.primary },
  dateMonth: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: AppColors.primary },
  info: { flex: 1, gap: 3 },
  complaint: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  outcome: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doctor: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: AppColors.primary },
});
