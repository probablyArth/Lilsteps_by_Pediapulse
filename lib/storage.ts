import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Lightweight cross-platform key-value store for non-secret app preferences
 * (active child selection, onboarding draft). SecureStore on native,
 * localStorage on web. All operations swallow errors — preference persistence
 * must never break the flow it decorates.
 *
 * Values must stay under SecureStore's 2KB iOS limit; for anything bigger,
 * use the chunked adapter in lib/supabase.ts as a reference.
 */
export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

/** Storage keys for persisted app preferences. */
export const StorageKeys = {
  activeChildId: 'lilsteps.activeChildId',
  onboardingDraft: 'lilsteps.onboardingDraft',
} as const;
