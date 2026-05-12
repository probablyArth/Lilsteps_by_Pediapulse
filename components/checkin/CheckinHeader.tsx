import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

export interface CheckinHeaderProps {
  title?: string;
  onBack: () => void;
  showStatusDot?: boolean;
  backDisabled?: boolean;
}

export function CheckinHeader({
  title = 'LilSteps AI',
  onBack,
  showStatusDot = false,
  backDisabled = false,
}: CheckinHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
      <LinearGradient
        colors={[
          AppColors.surface,
          AppColors.surface,
          `${AppColors.surface}E8`,
          `${AppColors.surface}B0`,
          `${AppColors.surface}60`,
          `${AppColors.surface}20`,
          `${AppColors.surface}00`,
        ]}
        locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
      <View style={styles.row} pointerEvents="box-none">
        <Pressable style={styles.backBtn} onPress={onBack} disabled={backDisabled}>
          <Ionicons name="chevron-back" size={24} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {showStatusDot && <View style={styles.statusDot} />}
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

export const CHECKIN_HEADER_HEIGHT = 60;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 17, color: AppColors.onSurface },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.successGreen },
  spacer: { flex: 1 },
});
