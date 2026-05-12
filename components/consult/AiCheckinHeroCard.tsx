import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'heroui-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export interface AiCheckinHeroCardProps {
  onStart: () => void;
}

export function AiCheckinHeroCard({ onStart }: AiCheckinHeroCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Body style={styles.body}>
        <LinearGradient
          colors={[`${AppColors.primary}08`, `${AppColors.primary}02`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGrad}
          >
            <Ionicons name="sparkles" size={24} color={AppColors.onPrimary} />
          </LinearGradient>
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>AI Health Check-in</Text>
          <Text style={styles.desc}>
            Answer a few questions and get personalized health insights for your child
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={onStart}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGrad}
          >
            <Text style={styles.startText}>Start Check-in</Text>
            <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </Card.Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: AppColors.surfaceContainerLowest, borderRadius: 20, overflow: 'hidden' },
  body: { padding: 20, gap: 16 },
  iconWrap: { alignSelf: 'flex-start' },
  iconGrad: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { gap: 6 },
  title: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: AppColors.onSurface,
    letterSpacing: -0.3,
  },
  desc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    lineHeight: 20,
  },
  startBtn: { borderRadius: 999, overflow: 'hidden', alignSelf: 'flex-start' },
  startGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onPrimary },
});
