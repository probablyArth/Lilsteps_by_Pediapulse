import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRACKET_CONFIG } from '@/constants/bracketConfig';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useChild } from '@/context/child';

const MENU_ITEMS = [
  { key: 'records', label: 'Health Records', icon: 'folder-outline', route: '/(tabs)/records' },
  { key: 'health-log', label: 'Health Log', icon: 'heart-outline', route: '/health-log' },
  { key: 'checkin', label: 'AI Health Check-in', icon: 'sparkles-outline', route: '/checkin' },
  { key: 'consult', label: 'Book Consultation', icon: 'calendar-outline', route: '/consult/booking' },
] as const;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { child, children, bracket, age, parentName, selectChild } = useChild();

  const childName = child?.name ?? 'Child';
  const bracketKey = bracket ?? 'TODDLER';
  const bracketCfg = BRACKET_CONFIG[bracketKey];
  const allergies = child?.allergies.map(a => a.name) ?? [];
  const conditions = child?.conditions.map(c => c.name) ?? [];

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <LinearGradient
          colors={[AppColors.primary, '#8b3cf7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileBlobTR} />
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{childName.charAt(0)}</Text>
          </View>
          <Text style={styles.profileName}>{childName}</Text>
          <Text style={styles.profileAge}>{age}</Text>
          <Text style={styles.profileBracket}>{bracketCfg.greetingSubtext(childName)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{child?.weight ?? '—'} kg</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{child?.height ?? '—'} cm</Text>
              <Text style={styles.statLabel}>Height</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Parent info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={AppColors.onSurfaceVariant} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Parent</Text>
              <Text style={styles.infoValue}>{parentName || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={AppColors.onSurfaceVariant} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Child switcher */}
        {children.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Switch Child</Text>
            <View style={styles.childList}>
              {children.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.childChip, c.id === child?.id && styles.childChipActive]}
                  onPress={() => selectChild(c.id)}
                >
                  <View style={[styles.childChipAvatar, c.id === child?.id && styles.childChipAvatarActive]}>
                    <Text style={[styles.childChipInitial, c.id === child?.id && styles.childChipInitialActive]}>
                      {c.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.childChipName, c.id === child?.id && styles.childChipNameActive]}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <View style={styles.tagRow}>
              {allergies.map((a) => (
                <View key={a} style={styles.allergyTag}>
                  <Ionicons name="warning-outline" size={12} color="#d97706" />
                  <Text style={styles.allergyTagText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chronic Conditions</Text>
            <View style={styles.tagRow}>
              {conditions.map((c) => (
                <View key={c} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.menuRow, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={AppColors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={`${AppColors.onSurfaceVariant}50`} />
            </Pressable>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: AppColors.onSurface },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },

  profileCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 6, overflow: 'hidden',
    shadowColor: AppColors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  profileBlobTR: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', marginBottom: 8,
  },
  profileAvatarText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#fff' },
  profileName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: '#fff', letterSpacing: -0.5 },
  profileAge: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  profileBracket: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: '#fff' },
  statLabel: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 16, gap: 14,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { gap: 2 },
  infoLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.onSurface },

  section: { gap: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onSurface },

  childList: { flexDirection: 'row', gap: 10 },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1.5, borderColor: `${AppColors.outlineVariant}35`,
  },
  childChipActive: { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}08` },
  childChipAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${AppColors.primaryContainer}40`, alignItems: 'center', justifyContent: 'center',
  },
  childChipAvatarActive: { backgroundColor: `${AppColors.primary}20` },
  childChipInitial: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: AppColors.onSurfaceVariant },
  childChipInitialActive: { color: AppColors.primary },
  childChipName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: AppColors.onSurface },
  childChipNameActive: { color: AppColors.primary },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef3c7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#fde68a',
  },
  allergyTagText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#92400e' },
  conditionTag: {
    backgroundColor: `${AppColors.secondary}18`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  conditionTagText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: AppColors.secondary },

  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 14, padding: 16,
    shadowColor: '#342c38', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: `${AppColors.primary}0d`, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: AppColors.onSurface, flex: 1 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 999,
    paddingVertical: 14, marginTop: 8,
  },
  signOutText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#ef4444' },
});
