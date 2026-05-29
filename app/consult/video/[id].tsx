// Parent-side video consultation entry.
//
// We use the 100ms hosted preview URL (open in the device browser) so that the
// app can ship on Expo Go without an EAS prebuild. The native SDK
// (@100mslive/react-native-room-kit) gives a richer in-app experience but
// requires `npx eas-cli prebuild` first — wire it after EAS init.

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/gradient-background';
import { AppColors } from '@/constants/theme';
import { layout, typography } from '@/styles/global';
import { supabase } from '@/lib/supabase';

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

  function openRoom() {
    if (!code) return;
    const url = `https://app.100ms.live/preview/${code}`;
    Linking.openURL(url);
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
