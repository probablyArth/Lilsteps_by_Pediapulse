---
name: screen-qa
description: This skill should be used after implementing or editing any screen in the LilSteps app, or when the user asks to "QA", "review", "check", or "audit" a screen. Runs a structured senior-engineer QA pass covering navigation, design system compliance, Android compatibility, dark mode, animation safety, and code stability.
---

# Screen QA

After implementing any screen, run this QA pass systematically. Report each category with pass/fail and the exact file:line for any failure.

## 1. Navigation — CRITICAL

Every screen except the final destination must have an exit path.

- [ ] **Splash / intro screens** call `router.replace('/<next-route>')` after animation ends
- [ ] **Animated exits** use `runOnJS` to call navigation from a Reanimated worklet:
  ```ts
  import { runOnJS } from 'react-native-reanimated';
  // Inside worklet callback:
  runOnJS(router.replace)('/home');
  ```
- [ ] **Timed navigation** uses `withTiming` callback or a JS `setTimeout` — not a bare `useEffect` sleep
- [ ] No screen is a dead end (user cannot go back or forward)

## 2. Design System Compliance

- [ ] Zero hardcoded hex strings — all colors use `AppColors.*` tokens
- [ ] Zero `borderWidth: 1` for sectioning (ghost border pattern only, with `outlineVariant` at 15% opacity)
- [ ] All text uses `fontFamily: 'PlusJakartaSans_*'` — no bare `fontWeight` without a matching `fontFamily`
- [ ] `ThemedText` not used for primary UI text (it uses system fonts, not Plus Jakarta Sans)
- [ ] Shadows use `AppColors.primary` or tinted colors — not `#000`, `'black'`, or generic gray
- [ ] Corner radii follow the design system scale (4 / 12 / 16 / 20 / 9999) — no arbitrary values like `5` or `8`

## 3. Android Compatibility

- [ ] No percentage strings on absolute-positioned `top/left/right/bottom`:
  ```ts
  // FAIL
  top: '-10%'
  // PASS
  top: -Dimensions.get('window').height * 0.1
  ```
- [ ] `elevation` provided alongside `shadowColor/shadowRadius` for Android shadow support
- [ ] `overflow: 'hidden'` used on any view using `borderRadius` that clips children (Android requires this)
- [ ] No `backdropFilter` (not supported on Android/RN — use semi-transparent backgrounds instead)

## 4. Dark Mode

- [ ] `StatusBar` style adapts to color scheme (not hardcoded `style="dark"`)
- [ ] Any component consuming `Colors.dark` has been verified with dark palette values — not arbitrary grays
- [ ] Background colors use `AppColors` surface tokens, which are defined for the current light theme (note dark mode palette as TODO if not yet defined)

## 5. Animation Safety

- [ ] Shared values from `useSharedValue` are used with `[]` in `useEffect` deps (refs are stable, they don't trigger re-renders)
- [ ] No animation started in render body — all animations triggered inside `useEffect` or gesture handlers
- [ ] `withRepeat` loops use `-1` (infinite) intentionally — confirm this is desired
- [ ] `entering` / `exiting` animation props only on `Animated.*` components, not plain `View`/`Text`
- [ ] No `useAnimatedStyle` returning new object references on every frame (avoid creating objects inside the worklet when values haven't changed)

## 6. Code Stability

- [ ] No `console.log` / `console.warn` left in production code
- [ ] `Dimensions.get('window')` called at module level for static layout; use `useWindowDimensions()` hook if the screen must respond to rotation/resize
- [ ] All `useEffect` hooks have a correct dependency array (no missing deps that could cause stale closures)
- [ ] TypeScript errors are zero — `as any` casts are flagged and justified
- [ ] No inline `StyleSheet` objects created inside render (causes re-allocation on every render):
  ```ts
  // FAIL
  <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
  // PASS (for dynamic values only — static styles always in StyleSheet.create)
  const styles = StyleSheet.create({ container: { flex: 1 } })
  ```

## 7. Reference Design Match

Before closing a screen implementation:
- [ ] Open `screens/<ScreenName>/reference.png` and visually compare
- [ ] Open `screens/<ScreenName>/reference.html` and verify spacing, colors, and hierarchy match
- [ ] Any intentional deviation from the reference is documented in a code comment

## QA Report Format

When running this QA pass, output results as:

```
## Screen QA: <ScreenName>

### PASS
- [1] Navigation exit path ✓
- [3] No percentage strings ✓

### FAIL
- [2] Hardcoded color at app/screens/HomeScreen.tsx:42 — replace '#FFFFFF' with AppColors.surfaceContainerLowest
- [5] useEffect dep missing at app/screens/HomeScreen.tsx:78 — lineHeight sharedValue included unnecessarily

### TODO (not blocking)
- [4] Dark mode palette not yet defined — Colors.dark uses placeholder values
```
