import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChild } from '@/context/child';
import { AppColors } from '@/constants/theme';

// Bracket-conditional: under 5 → Vaccine tab, 5+ → Consult tab
const UNDER_5_BRACKETS = ['NEWBORN', 'EARLY_INFANT', 'INFANT', 'TODDLER_EARLY', 'TODDLER', 'PRESCHOOL'];

// Left 2 tabs — always same
const LEFT_TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'growth', label: 'Growth', icon: 'trending-up-outline', iconActive: 'trending-up' },
] as const;

// Right 2 tabs — conditional on bracket
const RIGHT_TABS_UNDER5 = [
  { name: 'vaccine', label: 'Vaccine', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
  { name: 'records', label: 'Records', icon: 'folder-outline', iconActive: 'folder' },
] as const;

const RIGHT_TABS_5PLUS = [
  { name: 'consult', label: 'Consult', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'records', label: 'Records', icon: 'folder-outline', iconActive: 'folder' },
] as const;

const AI_BTN_SIZE = 56;
const AI_BTN_GAP = AI_BTN_SIZE + 16; // space reserved in tab row

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { bracket } = useChild();
  const under5 = bracket ? UNDER_5_BRACKETS.includes(bracket) : true;
  const rightTabs = under5 ? RIGHT_TABS_UNDER5 : RIGHT_TABS_5PLUS;

  function getRouteIndex(name: string) {
    return state.routes.findIndex((r) => r.name === name);
  }

  function pressTab(name: string) {
    const idx = getRouteIndex(name);
    if (idx === -1) return;
    const isFocused = state.index === idx;
    const event = navigation.emit({ type: 'tabPress', target: state.routes[idx].key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(name);
  }

  function renderTab(tab: { name: string; label: string; icon: string; iconActive: string }) {
    const idx = getRouteIndex(tab.name);
    const focused = idx !== -1 && state.index === idx;

    return (
      <Pressable
        key={tab.name}
        style={styles.tabItem}
        onPress={() => pressTab(tab.name)}
      >
        <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
          <Ionicons
            name={(focused ? tab.iconActive : tab.icon) as any}
            size={20}
            color={focused ? AppColors.primary : AppColors.onSurfaceVariant}
          />
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      {/* Elevated circular AI button */}
      <View style={styles.aiBtnWrapper} pointerEvents="box-none">
        <Pressable
          onPress={() => router.push('/checkin')}
          style={({ pressed }) => [styles.aiBtnPressable, { opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiBtn}
          >
            <Ionicons name="sparkles" size={24} color={AppColors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {LEFT_TABS.map((t) => renderTab(t))}
        {/* Spacer for the floating AI button */}
        <View style={{ width: AI_BTN_GAP }} />
        {rightTabs.map((t) => renderTab(t))}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="growth" />
      <Tabs.Screen name="vaccine" />
      <Tabs.Screen name="consult" />
      <Tabs.Screen name="records" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  aiBtnWrapper: {
    position: 'absolute',
    top: -(AI_BTN_SIZE / 2 + 8),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  aiBtnPressable: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 18,
  },
  aiBtn: {
    width: AI_BTN_SIZE,
    height: AI_BTN_SIZE,
    borderRadius: AI_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    height: 68,
    paddingHorizontal: 4,
    shadowColor: AppColors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  tabInnerActive: {
    backgroundColor: `${AppColors.primary}14`,
  },
  tabLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
  },
  tabLabelActive: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: AppColors.primary,
  },
});
