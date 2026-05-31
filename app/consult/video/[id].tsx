// Parent-side video consultation entry.
//
// Opens the self-hosted video page in the dashboard (/v/<code>) instead of
// 100ms's hosted Prebuilt — the latter requires a configured workspace
// subdomain and 404s on the default app.100ms.live domain.
//
// Base URL resolution:
//   1. EXPO_PUBLIC_VIDEO_BASE_URL if set (deployment or ngrok HTTPS URL)
//   2. Otherwise auto-derive from Expo Metro's host so phone -> Mac works:
//      Metro serves on 192.168.x.x:8082, dashboard runs on :3000.
//
// Phone-real-device caveat: browsers require HTTPS (or localhost) for
// getUserMedia. Plain LAN-IP HTTP works only for loading the page, not for
// camera/mic. For end-to-end phone testing run `ngrok http 3000` and set
// EXPO_PUBLIC_VIDEO_BASE_URL to the https://*.ngrok-free.app URL.

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/gradient-background';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';
import { supabase } from '@/lib/supabase';

function resolveVideoBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_VIDEO_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Web bundle (Expo dev) — same machine, same origin works.
  if (Platform.OS === 'web') return 'http://localhost:3000';

  // Native — use Metro's host so the phone hits the dev Mac's LAN IP.
  // hostUri looks like "192.168.29.127:8082". Strip the port, append :3000.
  const hostUri = (Constants.expoConfig?.hostUri ?? '').split(':')[0];
  if (hostUri) return `http://${hostUri}:3000`;

  // Last resort
  return 'http://localhost:3000';
}

interface VideoCodeResponse {
  code?: string;
  role?: string;
  error?: string;
}

export default function ParentVideoScreen() {
  const insets = useSafeAreaInsets();
  const { id: appointmentId } = useLocalSearchParams<{ id: string }>();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase.functions.invoke<VideoCodeResponse>(
        'video-room',
        { body: { appointmentId } },
      );
      if (err) setError(err.message);
      else if (!data?.code) setError(data?.error ?? 'No room code');
      else setCode(data.code);
      setLoading(false);
    })();
  }, [appointmentId]);

  const videoBase = resolveVideoBaseUrl();

  function openRoom() {
    if (!code) return;
    Linking.openURL(`${videoBase}/v/${code}`);
  }

  return (
    <View style={layout.screenContainer}>
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={AppColors.onSurface} />
        </Pressable>
        <Text style={typography.headingMD}>Video consult</Text>
      </View>

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={AppColors.primary} />
        ) : error ? (
          <Text style={[typography.bodyMD, styles.errorText]}>{error}</Text>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Ionicons name="videocam" size={36} color={AppColors.primary} />
            </View>
            <Text style={[typography.headingMD, styles.title]}>Ready to connect</Text>
            <Text style={[typography.bodySM, styles.subtitle]}>
              Tap below to join the consultation in your browser.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.joinBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={openRoom}
            >
              <Ionicons name="videocam" size={18} color={AppColors.onPrimary} />
              <Text style={styles.joinBtnText}>Join video call</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${AppColors.surfaceContainerLowest}B3`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${AppColors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { textAlign: 'center' },
  subtitle: {
    textAlign: 'center',
    color: AppColors.onSurfaceVariant,
    lineHeight: 22,
  },
  errorText: { color: AppColors.tertiary, textAlign: 'center' },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    marginTop: 8,
  },
  joinBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },
});
