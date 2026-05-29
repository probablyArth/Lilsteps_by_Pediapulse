import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { dbg } from '@/lib/debug';

/**
 * Registers for Expo push notifications and upserts the token into
 * `parents.expo_push_token`. Idempotent. No-op on simulators.
 *
 * Call once from a tree below AuthProvider after the user is signed in
 * — e.g. from a tabs layout effect.
 */
export function usePushTokenRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      if (!Device.isDevice) {
        dbg.hook('usePushToken: skipped — not a physical device');
        return;
      }

      try {
        const settings = await Notifications.getPermissionsAsync();
        let status = settings.status;
        if (status !== 'granted') {
          const req = await Notifications.requestPermissionsAsync();
          status = req.status;
        }
        if (status !== 'granted') {
          dbg.hook('usePushToken: permission denied');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;

        const tokenResp = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );

        if (cancelled || !tokenResp.data) return;

        dbg.hook('usePushToken: got token', { tokenPrefix: tokenResp.data.slice(0, 12) });

        const { error } = await supabase
          .from('parents')
          .update({ expo_push_token: tokenResp.data })
          .eq('id', user.id);

        if (error) dbg.dbError('usePushToken upsert', error);
      } catch (e) {
        dbg.hook('usePushToken: failed', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
