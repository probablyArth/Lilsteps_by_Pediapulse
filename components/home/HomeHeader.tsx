import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface HomeHeaderProps {
  childName: string;
  avatarInitial: string;
  hasUnread: boolean;
  paddingTop: number;
  onNotifications?: () => void;
}

export function HomeHeader({
  childName,
  avatarInitial,
  hasUnread,
  paddingTop,
  onNotifications,
}: HomeHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: paddingTop + 10 }]}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        <Text style={styles.appName}>LilSteps</Text>
      </View>

      <Pressable style={styles.bellButton} onPress={onNotifications}>
        <Ionicons name="notifications-outline" size={22} color={AppColors.onSurfaceVariant} />
        {hasUnread && <View style={styles.unreadDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${AppColors.primaryContainer}55`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${AppColors.primaryContainer}80`,
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.primary,
  },
  appName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: AppColors.primary,
    letterSpacing: -0.5,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.tertiary,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
