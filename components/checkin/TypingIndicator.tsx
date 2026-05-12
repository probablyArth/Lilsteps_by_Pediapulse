import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 300, easing: Easing.ease, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  const scale = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const opacity = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={16} color={AppColors.primary} />
        </View>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot1) }], opacity: opacity(dot1) }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot2) }], opacity: opacity(dot2) }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot3) }], opacity: opacity(dot3) }]} />
        </View>
      </View>
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
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primary },
});
