import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

import type { SymptomTileData } from './symptomTiles';

export interface SymptomTileProps {
  tile: SymptomTileData;
  active: boolean;
  size: number;
  onToggle: (key: string) => void;
}

export function SymptomTile({ tile, active, size, onToggle }: SymptomTileProps) {
  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      onPress={() => onToggle(tile.key)}
    >
      <Card style={[styles.card, { width: size }, active && styles.cardActive]}>
        <Card.Body style={[styles.body, { height: size - 3 }]}>
          {active && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color={AppColors.onPrimary} />
            </View>
          )}
          <View style={[styles.icon, active && styles.iconActive]}>
            <Ionicons
              name={tile.icon as any}
              size={22}
              color={active ? AppColors.onPrimary : AppColors.primary}
            />
          </View>
          <View style={styles.text}>
            <Text style={[styles.label, active && styles.labelActive]}>{tile.label}</Text>
            <Text style={styles.sub} numberOfLines={1}>{tile.sub}</Text>
          </View>
        </Card.Body>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  cardActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}04` },
  body: { padding: 16, justifyContent: 'space-between' },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconActive: { backgroundColor: AppColors.primary },
  text: { gap: 3 },
  label: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },
  labelActive: { color: AppColors.primary },
  sub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: AppColors.onSurfaceVariant },
});
