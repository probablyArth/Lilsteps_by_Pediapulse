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

const AI_BTN_SIZE = 52;

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

    if (focused) {
      return (
        <Pressable key={tab.name} style={styles.tabItem} onPress={() => pressTab(tab.name)}>
          <LinearGradient
            colors={[AppColors.primary, '#8b3cf7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeBox}
          >
            <Ionicons name={tab.iconActive as any} size={18} color="#fff" />
            <Text style={styles.activeLabel}>{tab.label}</Text>
          </LinearGradient>
        </Pressable>
      );
    }

    return (
      <Pressable key={tab.name} style={styles.tabItem} onPress={() => pressTab(tab.name)}>
        <Ionicons name={tab.icon as any} size={22} color={AppColors.onSurfaceVariant} />
        <Text style={styles.inactiveLabel}>{tab.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
      {/* Elevated AI button */}
      <View style={styles.aiBtnWrapper} pointerEvents="box-none">
        <Pressable
          onPress={() => router.push('/checkin')}
          style={({ pressed }) => [styles.aiBtnPressable, { opacity: pressed ? 0.88 : 1 }]}
        >
          <LinearGradient
            colors={[AppColors.primary, '#5c17b8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiBtn}
          >
            <Ionicons name="sparkles" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {LEFT_TABS.map((t) => renderTab(t))}
        <View style={{ width: AI_BTN_SIZE + 24 }} />
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
  },
  aiBtnWrapper: {
    position: 'absolute',
    top: -(AI_BTN_SIZE / 2 + 10),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  aiBtnPressable: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 16,
  },
  aiBtn: {
    width: AI_BTN_SIZE,
    height: AI_BTN_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: 64,
    paddingHorizontal: 6,
    shadowColor: '#342c38',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  activeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activeLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  inactiveLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
  },
});
