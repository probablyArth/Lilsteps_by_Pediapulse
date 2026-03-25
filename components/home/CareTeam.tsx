import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { typography } from '@/styles/global';

export interface CareProvider {
  id: string;
  name: string;
  role: string;
  initial: string;
}

interface CareTeamProps {
  providers: CareProvider[];
  onAddProvider?: () => void;
}

export function CareTeam({ providers, onAddProvider }: CareTeamProps) {
  return (
    <View style={styles.section}>
      <Text style={[typography.headingMD, styles.heading]}>Care Team</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {providers.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.initial}</Text>
              </View>
            </View>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.role}>{p.role}</Text>
          </View>
        ))}

        {/* Add provider slot */}
        <Pressable
          style={({ pressed }) => [styles.addCard, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onAddProvider}
        >
          <Ionicons name="person-add-outline" size={26} color={AppColors.onSurfaceVariant} />
          <Text style={styles.addLabel}>Add Provider</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  heading: {
    paddingHorizontal: 0,
  },
  scroll: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 36,
    backgroundColor: AppColors.surfaceContainer,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${AppColors.primaryContainer}60`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: AppColors.primary,
  },
  name: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.onSurface,
    textAlign: 'center',
  },
  role: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  addCard: {
    width: 110,
    backgroundColor: `${AppColors.surfaceContainer}70`,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${AppColors.outlineVariant}50`,
  },
  addLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
