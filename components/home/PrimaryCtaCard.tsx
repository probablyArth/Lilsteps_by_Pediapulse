import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface PrimaryCtaCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function PrimaryCtaCard({ title, subtitle, onPress }: PrimaryCtaCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.93 : 1 })}>
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative blobs */}
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />

        <View style={styles.inner}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.circleBtn}>
            <Ionicons name="add" size={28} color={AppColors.primary} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  blobTR: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  blobBL: {
    position: 'absolute',
    bottom: -24,
    left: 40,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
});
