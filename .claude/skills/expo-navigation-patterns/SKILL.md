---
name: expo-navigation-patterns
description: This skill should be used when adding navigation between screens, creating new routes, wiring up a tab navigator, implementing screen transitions, or handling the splash-to-app flow in LilSteps. Applies when the user mentions routing, router.push, router.replace, tab navigation, Stack, or asks how to move between screens.
version: 1.0.0
---

# Expo Router Navigation Patterns

LilSteps uses **Expo Router v6** with file-based routing. Every screen must have a clear entry and exit path.

## File-Based Route Structure

```
app/
├── _layout.tsx          # Root Stack — font loading, SplashScreen, StatusBar
├── index.tsx            # Entry point → always redirects to real first screen
├── (tabs)/
│   ├── _layout.tsx      # Tab navigator definition
│   ├── home.tsx         # /home
│   ├── records.tsx      # /records
│   └── profile.tsx      # /profile
├── onboarding.tsx       # /onboarding (pre-tab flow)
└── [id].tsx             # Dynamic route — /123
```

**Rule:** `app/index.tsx` is the splash/entry screen. It must ALWAYS navigate away — it is never a permanent screen.

## Splash → App Navigation

The splash screen must call `router.replace` after its animation completes. Never leave the user on the splash screen.

### Pattern A — JS Timer (simple)
```ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');  // or '/(tabs)/home'
    }, 3000);  // total animation duration

    return () => clearTimeout(timer);  // always clean up
  }, []);

  // ... render animation
}
```

### Pattern B — Triggered from Animation Callback (preferred for precision)
```ts
import { useRouter } from 'expo-router';
import { runOnJS } from 'react-native-reanimated';
import { useSharedValue, withTiming, withDelay } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(1);

  function navigate() {
    router.replace('/onboarding');
  }

  useEffect(() => {
    opacity.value = withDelay(
      2800,
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(navigate)();
      })
    );
  }, []);
}
```

**Why `runOnJS`:** Reanimated worklet callbacks run on the UI thread. `router.replace` must run on the JS thread. Calling it directly from a worklet will crash.

## Stack Navigator Setup (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

Only explicitly register screens that need non-default options. Expo Router auto-discovers all others.

## Tab Navigator Setup (`app/(tabs)/_layout.tsx`)

```tsx
import { Tabs } from 'expo-router';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: `${AppColors.surfaceContainerLowest}E6`,  // 90% opacity glass
          borderTopWidth: 0,  // No-Line Rule applies to tab bar too
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="records" options={{ title: 'Records' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

## Navigation Methods

| Method | Use case |
|--------|----------|
| `router.replace('/route')` | One-way transitions (splash → app, onboarding → home). No back stack. |
| `router.push('/route')` | Drill-down navigation. User can go back. |
| `router.back()` | Go back one screen in the stack. |
| `<Link href="/route">` | Declarative navigation in JSX. |

**Use `replace` for flows the user should never back-navigate into** (splash, onboarding, auth screens).

## Conditional Navigation (Auth / Onboarding Gate)

Handle routing logic in `_layout.tsx`, not in individual screens:

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isOnboarded = false; // replace with real state

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';
    if (!isOnboarded && inTabsGroup) {
      router.replace('/onboarding');
    } else if (isOnboarded && !inTabsGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isOnboarded, segments]);
}
```

## Passing Data Between Screens

Use route params for simple values:
```ts
// Push with params
router.push({ pathname: '/records/[id]', params: { id: '123' } });

// Receive in target screen
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

For complex shared state (user session, health records), use a state management solution (Zustand, Context) — do not pass large objects through route params.

## Screen Transition Animations

Default Stack animation options:
```ts
<Stack.Screen
  name="onboarding"
  options={{
    animation: 'fade',          // 'slide_from_right' | 'fade' | 'none'
    animationDuration: 300,
  }}
/>
```

For custom enter/exit animations on a screen level, use Reanimated's `entering`/`exiting` props on the root view — not on a wrapper outside the navigator.

## Common Mistakes

1. **Calling `router.replace` in a Reanimated worklet without `runOnJS`** → crash
2. **No navigation on splash screen** → user is permanently stuck
3. **Using `router.push` for auth flow** → user can navigate back to login/splash
4. **Gating navigation in screen components** → creates flash/race conditions; always gate in `_layout.tsx`
5. **`<Stack.Screen>` outside a `<Stack>`** → Expo Router silently ignores it
