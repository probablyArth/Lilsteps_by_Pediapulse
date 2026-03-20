---
name: lilsteps-design-system
description: This skill should be used when building, editing, or reviewing any screen, component, or style in the LilSteps app. Applies when the user asks to implement a screen, add a component, review styling, match a reference design, or work with colors, typography, spacing, or layout in this project. Enforces DESIGN.md rules and AppColors token usage to prevent design system violations before they happen.
version: 1.0.0
---

# LilSteps Design System

Enforces the "Serene Guardian" design system for LilSteps — a pediatric health app where every visual decision must balance clinical authority with nursery warmth.

Always read `DESIGN.md` at the project root before implementing any screen. The rules below are the operational distillation of it.

## Color Rules

**Always use `AppColors` tokens. Never hardcode hex values.**

```ts
// WRONG
color: '#751fe7'
backgroundColor: '#FFFFFF'
borderColor: 'rgba(255,255,255,0.2)'

// CORRECT
color: AppColors.primary
backgroundColor: AppColors.surfaceContainerLowest
borderColor: `${AppColors.outlineVariant}26`  // 15% opacity = 26 in hex
```

Import path: `import { AppColors } from '@/constants/theme';`

**Surface hierarchy** — use in this order, never skip levels arbitrarily:
- `AppColors.surface` — page/screen background (#fff3ff)
- `AppColors.surfaceContainer` — major section groupings (#f3e3f6)
- `AppColors.surfaceContainerLow` — secondary groupings (#fbecfe)
- `AppColors.surfaceContainerLowest` — primary cards, "lifted" interactive elements (#ffffff)
- `AppColors.surfaceContainerHigh` / `surfaceContainerHighest` — deepest inset elements

**Text tokens:**
- `AppColors.onSurface` — primary text (#342c38). Never use pure black.
- `AppColors.onSurfaceVariant` — secondary/metadata text (#625865)
- `AppColors.primary` — links and active states (#751fe7)
- `AppColors.onPrimaryContainer` — text on primary-colored backgrounds (#30006a)

## The No-Line Rule

**`borderWidth: 1` for sectioning or card edges is strictly prohibited.**

Achieve visual boundaries through:
1. **Background color shifts** — place `surfaceContainerLowest` card on `surfaceContainer` background
2. **Ghost Border fallback** (accessibility only) — `outlineVariant` at 15% opacity:
   ```ts
   borderWidth: 1,
   borderColor: `${AppColors.outlineVariant}26`,
   ```

The glass card in the splash screen currently violates this with `rgba(255,255,255,0.2)`. Use the ghost border pattern or remove the border entirely.

## Typography Rules

**Always use named Plus Jakarta Sans font families. Never use `fontWeight` alone.**

```ts
// WRONG — falls back to system font
fontWeight: 'bold'
fontWeight: '600'

// CORRECT — explicit font family
fontFamily: 'PlusJakartaSans_400Regular'
fontFamily: 'PlusJakartaSans_500Medium'
fontFamily: 'PlusJakartaSans_600SemiBold'
fontFamily: 'PlusJakartaSans_700Bold'
fontFamily: 'PlusJakartaSans_800ExtraBold'
```

**Available weights and use cases:**
| Weight | Family Key | Use |
|--------|------------|-----|
| 400 | `PlusJakartaSans_400Regular` | Body text |
| 500 | `PlusJakartaSans_500Medium` | Taglines, captions |
| 600 | `PlusJakartaSans_600SemiBold` | Card titles, labels |
| 700 | `PlusJakartaSans_700Bold` | Section headers, badges |
| 800 | `PlusJakartaSans_800ExtraBold` | Brand name, hero display |

**Typography scale:**
- Brand/Display: 36px, ExtraBold, letterSpacing: -0.5
- Section Headline: 24px, Bold
- Card Title: 18px, SemiBold
- Body: 16px, Regular, lineHeight: 24 (1.5x)
- Label/Metadata: 12–14px, Medium, `onSurfaceVariant`
- Eyebrow/Badge: 10–11px, Bold, letterSpacing: 1.5–3.5, uppercase

## Glassmorphism Pattern

For floating elements (bottom cards, modals, nav bars):
```ts
{
  backgroundColor: `${AppColors.surfaceContainerLowest}B3`,  // 70% opacity
  borderRadius: 16,   // lg = standard card
  // borderRadius: 48 for pill shapes
  // No borderWidth unless ghost border is needed for accessibility
}
```

Corner radius guide:
- `4` — small chips, badges
- `12` — input fields
- `16` — standard cards (lg)
- `20` — logo icons, prominent elements
- `48` or `9999` — pill buttons, avatars

## Gradient Rule

For high-impact areas (logo, primary buttons, hero banners):
```ts
colors={[AppColors.primary, AppColors.primaryContainer]}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```

Never use flat `AppColors.primary` background where a gradient is possible on a primary action.

## Elevation & Shadows

Shadows must be soft, tinted, and diffused — never dark grey:
```ts
shadowColor: AppColors.primary,        // Tinted, not black
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.2,
shadowRadius: 24,
elevation: 12,                          // Android
```

For content shadows (not glowing): use `AppColors.onSurface` at ~6% opacity.

## Layout Rules

**Absolute positioning:** Never use percentage strings (`'-10%'`, `'50%'`) for `top/left/right/bottom`. Use `Dimensions.get('window')` pixel values instead.
```ts
// WRONG
top: '-10%'

// CORRECT
const { width, height } = Dimensions.get('window');
top: -height * 0.1
```

**Spacing tokens:**
- Screen horizontal padding: 24
- Card internal padding: 20
- Section gap (major): 48–96
- Component gap (minor): 16–24
- Tight gap (inside component): 6–8

## Dark Mode

`Colors.dark` in `constants/theme.ts` must use proper dark-mode `AppColors` variants — not arbitrary grays. Until a dark palette is defined, document it explicitly. Don't silently ship components that break in dark mode.

## Component Checklist

Before marking any screen complete, verify:
- [ ] All colors use `AppColors.*` tokens
- [ ] No `borderWidth: 1` for sectioning (ghost border pattern only if needed)
- [ ] All text uses `fontFamily: 'PlusJakartaSans_*'` not `fontWeight` alone
- [ ] No percentage strings in absolute positioned `top/left/right/bottom`
- [ ] Shadows are tinted (not grey/black)
- [ ] Cards use `surfaceContainerLowest` on a darker surface background
- [ ] Gradients used on primary action buttons and logo elements
- [ ] Corner radii follow the scale (no `borderRadius: 5` or arbitrary values)
