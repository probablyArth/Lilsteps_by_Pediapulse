import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface HealthTipProps {
  tip: string;
}

export function HealthTip({ tip }: HealthTipProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="bulb-outline" size={20} color="#2d7a4f" />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Healthy Tip</Text>
        <Text style={styles.body}>{tip}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e7f5ed',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#2d7a4f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45,122,79,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: '#1a4d31',
  },
  body: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: '#2d5e3f',
    lineHeight: 19,
    opacity: 0.85,
  },
});
