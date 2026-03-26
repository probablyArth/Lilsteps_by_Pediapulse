import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ListGroup, Separator } from 'heroui-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRACKET_CONFIG } from '@/constants/bracketConfig';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useChild } from '@/context/child';

const HEADER_HEIGHT = 60;

const QUICK_LINKS = [
  { key: 'records', label: 'Health Records', desc: 'Documents, prescriptions', icon: 'folder-outline', route: '/(tabs)/records' },
  { key: 'health-log', label: 'Health Log', desc: 'Track symptoms, moods', icon: 'heart-outline', route: '/health-log' },
  { key: 'checkin', label: 'AI Health Check-in', desc: 'Smart symptom triage', icon: 'sparkles-outline', route: '/checkin' },
  { key: 'consult', label: 'Book Consultation', desc: 'Schedule with doctors', icon: 'calendar-outline', route: '/consult/booking' },
] as const;

const SETTINGS_ITEMS = [
  { key: 'notifications', label: 'Notifications', desc: 'Alerts, reminders', icon: 'notifications-outline' },
  { key: 'privacy', label: 'Privacy & Security', desc: 'Data, permissions', icon: 'shield-checkmark-outline' },
  { key: 'help', label: 'Help & Support', desc: 'FAQ, contact us', icon: 'help-circle-outline' },
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
    <View style={styles.screen}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
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
        <View style={styles.header} pointerEvents="box-none">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={AppColors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: 40 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
      >
        <LinearGradient
          colors={[AppColors.primary, AppColors.gradientEnd]}
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <ListGroup style={styles.listGroup}>
            <ListGroup.Item style={styles.listItem}>
              <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.primary}12` }]}>
                  <Ionicons name="person-outline" size={20} color={AppColors.primary} />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent style={styles.listItemContent}>
                <ListGroup.ItemTitle style={styles.listItemTitle}>Parent</ListGroup.ItemTitle>
                <ListGroup.ItemDescription style={styles.listItemDesc}>
                  {parentName || 'Not set'}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
            </ListGroup.Item>
            <Separator style={styles.separator} />
            <ListGroup.Item style={styles.listItem}>
              <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.secondary}12` }]}>
                  <Ionicons name="mail-outline" size={20} color={AppColors.secondary} />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent style={styles.listItemContent}>
                <ListGroup.ItemTitle style={styles.listItemTitle}>Email</ListGroup.ItemTitle>
                <ListGroup.ItemDescription style={styles.listItemDesc}>
                  {user?.email ?? '—'}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
            </ListGroup.Item>
          </ListGroup>
        </View>

        {children.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Switch Child</Text>
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
                  {c.id === child?.id && (
                    <View style={styles.childChipCheck}>
                      <Ionicons name="checkmark" size={12} color={AppColors.onPrimary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {(allergies.length > 0 || conditions.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Health Info</Text>
            <ListGroup style={styles.listGroup}>
              {allergies.length > 0 && (
                <ListGroup.Item style={styles.listItem}>
                  <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                    <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.warningAmber}15` }]}>
                      <Ionicons name="warning-outline" size={20} color={AppColors.warningAmber} />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent style={styles.listItemContent}>
                    <ListGroup.ItemTitle style={styles.listItemTitle}>Allergies</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription style={styles.listItemDesc}>
                      {allergies.join(', ')}
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{allergies.length}</Text>
                    </View>
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
              )}
              {allergies.length > 0 && conditions.length > 0 && <Separator style={styles.separator} />}
              {conditions.length > 0 && (
                <ListGroup.Item style={styles.listItem}>
                  <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                    <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.tertiary}12` }]}>
                      <Ionicons name="medical-outline" size={20} color={AppColors.tertiary} />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent style={styles.listItemContent}>
                    <ListGroup.ItemTitle style={styles.listItemTitle}>Chronic Conditions</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription style={styles.listItemDesc}>
                      {conditions.join(', ')}
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <View style={[styles.countBadge, { backgroundColor: `${AppColors.tertiary}15` }]}>
                      <Text style={[styles.countBadgeText, { color: AppColors.tertiary }]}>{conditions.length}</Text>
                    </View>
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
              )}
            </ListGroup>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Links</Text>
          <ListGroup style={styles.listGroup}>
            {QUICK_LINKS.map((item, index) => (
              <View key={item.key}>
                <ListGroup.Item
                  style={styles.listItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                    <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.primary}12` }]}>
                      <Ionicons name={item.icon as any} size={20} color={AppColors.primary} />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent style={styles.listItemContent}>
                    <ListGroup.ItemTitle style={styles.listItemTitle}>{item.label}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription style={styles.listItemDesc}>{item.desc}</ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix iconProps={{ size: 16, color: AppColors.outlineVariant }} />
                </ListGroup.Item>
                {index < QUICK_LINKS.length - 1 && <Separator style={styles.separator} />}
              </View>
            ))}
          </ListGroup>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <ListGroup style={styles.listGroup}>
            {SETTINGS_ITEMS.map((item, index) => (
              <View key={item.key}>
                <ListGroup.Item style={styles.listItem}>
                  <ListGroup.ItemPrefix style={styles.listItemPrefix}>
                    <View style={[styles.listItemIcon, { backgroundColor: `${AppColors.onSurfaceVariant}10` }]}>
                      <Ionicons name={item.icon as any} size={20} color={AppColors.onSurfaceVariant} />
                    </View>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent style={styles.listItemContent}>
                    <ListGroup.ItemTitle style={styles.listItemTitle}>{item.label}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription style={styles.listItemDesc}>{item.desc}</ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix iconProps={{ size: 16, color: AppColors.outlineVariant }} />
                </ListGroup.Item>
                {index < SETTINGS_ITEMS.length - 1 && <Separator style={styles.separator} />}
              </View>
            ))}
          </ListGroup>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color={AppColors.errorRed} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>LilSteps v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.surface },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  backBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 17,
    color: AppColors.onSurface,
  },
  headerSpacer: { flex: 1 },

  scroll: { paddingHorizontal: 20, gap: 24 },

  profileCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  profileBlobTR: {
    position: 'absolute', top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: AppColors.onPrimary,
  },
  profileName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 26,
    color: AppColors.onPrimary,
    letterSpacing: -0.5,
  },
  profileAge: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  profileBracket: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 16,
    gap: 24,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: AppColors.onPrimary,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  section: { gap: 10 },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },

  listGroup: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 18,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemPrefix: {
    marginRight: 14,
  },
  listItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    gap: 2,
  },
  listItemTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurface,
  },
  listItemDesc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  separator: {
    marginHorizontal: 16,
    backgroundColor: `${AppColors.outlineVariant}20`,
  },

  countBadge: {
    backgroundColor: `${AppColors.warningAmber}15`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    color: AppColors.warningAmber,
  },

  childList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: `${AppColors.outlineVariant}20`,
  },
  childChipActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}06`,
  },
  childChipAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  childChipAvatarActive: {
    backgroundColor: AppColors.primary,
  },
  childChipInitial: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: AppColors.primary,
  },
  childChipInitialActive: {
    color: AppColors.onPrimary,
  },
  childChipName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: AppColors.onSurface,
  },
  childChipNameActive: {
    color: AppColors.primary,
  },
  childChipCheck: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: AppColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${AppColors.errorRed}08`,
    borderWidth: 1.5,
    borderColor: `${AppColors.errorRed}30`,
    borderRadius: 14,
    paddingVertical: 16,
  },
  signOutText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: AppColors.errorRed,
  },

  versionText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: AppColors.outlineVariant,
    textAlign: 'center',
    marginTop: 8,
  },
});
