import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { DoctorRow } from '@/hooks/useDoctors';

export interface DoctorCardCompactProps {
  doctor: DoctorRow;
  onBook: (id: string) => void;
}

export function DoctorCardCompact({ doctor, onBook }: DoctorCardCompactProps) {
  return (
    <Card style={styles.card}>
      <Card.Body style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{doctor.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{doctor.name}</Text>
        <Text style={styles.spec}>{doctor.specialisation}</Text>
        <Text style={styles.hospital} numberOfLines={2}>{doctor.hospital}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.bookPill,
            !doctor.is_available && styles.bookPillDisabled,
            { opacity: pressed ? 0.75 : 1 },
          ]}
          onPress={() => doctor.is_available && onBook(doctor.id)}
        >
          <Text style={[styles.bookText, !doctor.is_available && styles.bookTextDisabled]}>
            {doctor.is_available ? 'Book' : 'Unavailable'}
          </Text>
        </Pressable>
      </Card.Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
  },
  body: { padding: 14, gap: 6, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${AppColors.primaryContainer}50`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: AppColors.primary },
  name: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface, textAlign: 'center' },
  spec: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.primary, textAlign: 'center' },
  hospital: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant, textAlign: 'center' },
  bookPill: {
    marginTop: 6,
    backgroundColor: AppColors.primary,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  bookPillDisabled: { backgroundColor: AppColors.surfaceContainerHigh },
  bookText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.onPrimary },
  bookTextDisabled: { color: AppColors.onSurfaceVariant },
});
