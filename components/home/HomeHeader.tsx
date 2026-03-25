import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, Button } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={[styles.wrapper, { paddingTop }]} pointerEvents="box-none">
      <LinearGradient
        colors={[
          AppColors.surface,
          AppColors.surface,
          `${AppColors.surface}E8`,
          `${AppColors.surface}B0`,
          `${AppColors.surface}60`,
          `${AppColors.surface}20`,
          'transparent',
        ]}
        locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
      
      <View style={styles.content} pointerEvents="box-none">
        <View style={styles.left}>
          <View style={styles.avatarRing}>
            <Avatar
              alt={`${childName}'s avatar`}
              size="sm"
              color="accent"
              variant="soft"
            >
              <Avatar.Fallback>
                {avatarInitial}
              </Avatar.Fallback>
            </Avatar>
          </View>
          <View style={styles.brandContainer}>
            <Text style={styles.brandPrefix}>Lil</Text>
            <Text style={styles.brandName}>Steps</Text>
          </View>
        </View>

        <View style={styles.bellWrapper}>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onNotifications}
            style={styles.bellButton}
          >
            <Ionicons name="notifications-outline" size={20} color={AppColors.primary} />
          </Button>
          {hasUnread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    backgroundColor: AppColors.surfaceContainerLowest,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandPrefix: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 17,
    color: AppColors.onSurfaceVariant,
    letterSpacing: -0.3,
  },
  brandName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    color: AppColors.primary,
    letterSpacing: -0.3,
  },
  bellWrapper: {
    position: 'relative',
  },
  bellButton: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.tertiary,
    borderWidth: 1.5,
    borderColor: AppColors.surfaceContainerLowest,
    zIndex: 10,
  },
});
