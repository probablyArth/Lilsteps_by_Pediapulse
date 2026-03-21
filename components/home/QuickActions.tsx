import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface QuickActionsProps {
  onBook?: () => void;
  onGrowth?: () => void;
  onVaccines?: () => void;
  onRecords?: () => void;
}

const ACTIONS = [
  { key: 'book', label: 'Book', icon: 'calendar-outline' },
  { key: 'growth', label: 'Growth', icon: 'trending-up-outline' },
  { key: 'vaccines', label: 'Vaccines', icon: 'shield-checkmark-outline' },
  { key: 'records', label: 'Records', icon: 'folder-outline' },
] as const;

export function QuickActions({ onBook, onGrowth, onVaccines, onRecords }: QuickActionsProps) {
  const handlers = {
    book: onBook ?? (() => {}),
    growth: onGrowth ?? (() => {}),
    vaccines: onVaccines ?? (() => {}),
    records: onRecords ?? (() => {}),
  };

  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handlers[action.key]}
        >
          <View style={styles.iconBox}>
            <Ionicons name={action.icon as any} size={22} color={AppColors.primary} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: AppColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
