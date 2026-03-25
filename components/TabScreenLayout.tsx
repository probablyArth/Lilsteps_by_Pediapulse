import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

interface TabScreenLayoutProps {
  children: ReactNode;
  headerContent: ReactNode;
  scrollContentStyle?: ViewStyle;
  headerPaddingBottom?: number;
}

const HEADER_HEIGHT = 70;

const GradientFade = memo(function GradientFade() {
  return (
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
  );
});

export const TabScreenLayout = memo(function TabScreenLayout({
  children,
  headerContent,
  scrollContentStyle,
  headerPaddingBottom = 40,
}: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <GradientFade />
        <View style={[styles.headerContent, { paddingBottom: headerPaddingBottom }]} pointerEvents="box-none">
          {headerContent}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: 110 + insets.bottom },
          scrollContentStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
});
