import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider } from '@/context/auth';
import { ChildProvider } from '@/context/child';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ChildProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(auth)"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="(onboarding)"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="checkin"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="consult"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="health-log"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="records"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="profile"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ChildProvider>
    </AuthProvider>
  );
}
