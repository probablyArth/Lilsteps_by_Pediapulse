import { Platform } from 'react-native';

export const AppColors = {
  primary: '#751fe7',
  primaryContainer: '#b58bff',
  primaryDim: '#6800d8',
  secondary: '#9720ab',
  secondaryContainer: '#fcbcff',
  tertiary: '#b60051',
  tertiaryContainer: '#ff8fa9',
  surface: '#fff3ff',
  surfaceContainer: '#f3e3f6',
  surfaceContainerHigh: '#eeddf1',
  surfaceContainerHighest: '#e8d7ed',
  surfaceContainerLow: '#fbecfe',
  surfaceContainerLowest: '#ffffff',
  surfaceDim: '#e0cfe5',
  onSurface: '#342c38',
  onSurfaceVariant: '#625865',
  onPrimary: '#f9efff',
  onPrimaryContainer: '#30006a',
  outline: '#7e7381',
  outlineVariant: '#b5a9b8',
  background: '#fff3ff',
  onBackground: '#342c38',
} as const;

export const Colors = {
  light: {
    text: AppColors.onSurface,
    background: AppColors.background,
    tint: AppColors.primary,
    icon: AppColors.onSurfaceVariant,
    tabIconDefault: AppColors.onSurfaceVariant,
    tabIconSelected: AppColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
