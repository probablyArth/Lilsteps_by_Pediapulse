# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LilSteps is a React Native mobile application built with Expo (v54) and TypeScript. It targets iOS, Android, and Web platforms from a shared codebase.

## Development Commands

```bash
# Start development server
npm start              # or: npx expo start

# Run on specific platform
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web            # Web browser

# Linting
npm run lint           # ESLint with Expo config

# Reset to blank project
npm run reset-project  # Moves app/ to app-example/
```

## Architecture

**Routing**: Expo Router with file-based routing in `app/` directory. Routes are defined by file structure:
- `app/index.tsx` - Splash screen (entry point)
- `app/(auth)/` - Auth flow group (login, signup)
- `app/(tabs)/` - Tab navigator group (future main app)
- `app/_layout.tsx` - Root layout wrapper (font loading, navigation stack)

**Theming**: Design system colors via `constants/theme.ts`, design philosophy in `DESIGN.md`:
- `AppColors` — Material Design 3 color tokens used across all components
- `styles/global.ts` — shared typography and layout presets

**Platform-specific code**: Uses file extensions for platform variants:
- `.ios.tsx` - iOS-specific implementation
- `.web.ts` - Web-specific implementation

## Key Configuration

- **TypeScript**: Strict mode enabled, path alias `@/*` maps to project root
- **New Architecture**: React Native new architecture enabled
- **React Compiler**: Experimental React compiler enabled
- **Typed Routes**: Expo Router typed routes enabled

## Screen Development Ruleset

When building any new screen, reference assets are stored in the `screens/` directory at the project root. Each screen has its own subfolder:

```
screens/
  <ScreenName>/
    reference.html    # HTML mockup of the screen layout and design
    reference.png     # Reference image/screenshot of the intended design
```

**Rules for implementing screens:**

1. **Always check `screens/<ScreenName>/`** before implementing a screen — both the HTML file and the image must be used as the source of truth for layout, spacing, colors, and component structure.
2. **The reference image** defines the visual target. Match it as closely as possible in the React Native implementation.
3. **The HTML file** provides structural and styling details (colors, fonts, spacing, hierarchy) that may not be fully visible in the image. Use it to extract exact values.
4. **Do not deviate** from the reference design without explicit instruction from the user.
5. **Folder naming** must match the screen name exactly (e.g., `screens/HomeScreen/`, `screens/OnboardingScreen/`).
6. **Always reference `DESIGN.md`** at the project root before building any screen. This file defines the app's design system — color palette, typography, spacing, and component styles. All screens must follow the design tokens and theme defined there to ensure visual consistency across the app.

## Component & Style Rules

**No repetitive code — extract reusable components:**

1. **All reusable components live in `components/`**. Before writing any UI element inline in a screen, check if a matching component already exists. If a piece of UI is used (or could be used) on more than one screen, it **must** be a component.
2. **Screen files (`app/`) should be thin** — they compose components and contain only screen-specific layout/logic. Screens should NOT define reusable UI inline.
3. **Existing reusable components** (add to this list as the app grows):
   - `AppLogo` — brand logo icon + name
   - `GradientBackground` — full-screen mesh gradient with decorative blobs
   - `GlassCard` — frosted-glass card container
   - `AvatarStack` — overlapping avatar circles with count badge
   - `GradientButton` — primary action button with signature gradient pill shape
   - `TextInputField` — styled text input with focus states per DESIGN.md

**Style separation — global vs screen-specific:**

4. **Global/shared styles live in `styles/global.ts`**. This includes typography presets (`typography.*`), common layout patterns (`layout.*`), and any style that is used across multiple screens. Always import from here instead of re-declaring font families, font sizes, or common layouts.
5. **Screen-specific styles stay co-located** with their screen file in a `StyleSheet.create()` block at the bottom. These should only contain layout overrides and positioning unique to that screen (e.g., margins, absolute positioning, alignment tweaks).
6. **Tab screens** (`app/(tabs)/*.tsx`) follow the same rule — each tab screen has its own co-located `StyleSheet` for screen-specific styles, and imports shared styles from `styles/global.ts`.
7. **Never duplicate style values**. If you find yourself writing the same `fontFamily`, `fontSize`, `color`, or layout pattern in more than one file, move it to `styles/global.ts` or `constants/theme.ts`.
