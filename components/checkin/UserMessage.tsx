import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export function UserMessage({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  bubble: {
    maxWidth: '80%',
    backgroundColor: AppColors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, color: AppColors.onPrimary, lineHeight: 24 },
});
