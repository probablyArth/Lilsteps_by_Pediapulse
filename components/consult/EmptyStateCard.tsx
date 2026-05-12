import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface EmptyStateCardProps {
  icon: string;
  title: string;
  body: string;
}

export function EmptyStateCard({ icon, title, body }: EmptyStateCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Body style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={28} color={AppColors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.bodyText}>{body}</Text>
      </Card.Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}20`,
  },
  body: { padding: 24, alignItems: 'center', gap: 8 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  bodyText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
