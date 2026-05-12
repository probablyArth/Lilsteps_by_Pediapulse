import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface AiMessageProps {
  text: string;
  quickOptions?: string[];
  onOptionTap?: (option: string) => void;
}

export function AiMessage({ text, quickOptions, onOptionTap }: AiMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={16} color={AppColors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
      {quickOptions && quickOptions.length > 0 && (
        <View style={styles.optionsRow}>
          {quickOptions.map((opt) => (
            <Pressable
              key={opt}
              style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => onOptionTap?.(opt)}
            >
              <Text style={styles.chipText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: { flex: 1, paddingRight: 40 },
  text: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, color: AppColors.onSurface, lineHeight: 24 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingLeft: 40 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}40`,
    backgroundColor: AppColors.surfaceContainerLowest,
  },
  chipText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onSurface },
});
