import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button, PressableFeedback } from 'heroui-native';

import { AppColors } from '@/constants/theme';

interface QuickActionsProps {
  onBook?: () => void;
  onGrowth?: () => void;
  onVaccines?: () => void;
  onRecords?: () => void;
}

const ACTIONS = [
  { key: 'book', label: 'Book', iconFamily: 'Feather', iconName: 'calendar' },
  { key: 'growth', label: 'Growth', iconFamily: 'Feather', iconName: 'trending-up' },
  { key: 'vaccines', label: 'Vaccines', iconFamily: 'MaterialCommunityIcons', iconName: 'shield-check-outline' },
  { key: 'records', label: 'Records', iconFamily: 'Feather', iconName: 'folder' },
] as const;

export function QuickActions({ onBook, onGrowth, onVaccines, onRecords }: QuickActionsProps) {
  const handlers = {
    book: onBook ?? (() => {}),
    growth: onGrowth ?? (() => {}),
    vaccines: onVaccines ?? (() => {}),
    records: onRecords ?? (() => {}),
  };

  const renderIcon = (family: string, name: string) => {
    if (family === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={name as any} size={24} color={AppColors.primary} />;
    }
    return <Feather name={name as any} size={22} color={AppColors.primary} />;
  };

  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <PressableFeedback
          key={action.key}
          style={styles.item}
          onPress={handlers[action.key]}
        >
          <View pointerEvents="none">
            <Button
              isIconOnly
              variant="secondary"
              size="lg"
              style={styles.iconBox}
            >
              {renderIcon(action.iconFamily, action.iconName)}
            </Button>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </PressableFeedback>
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
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
