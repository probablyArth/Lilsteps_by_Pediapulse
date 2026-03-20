# Design System Strategy: Pediatric Excellence

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star: **"The Serene Guardian."** 

In the high-stakes world of pediatric health, parents require a sanctuary—a digital environment that balances clinical authority with the warmth of a nursery. We move beyond the "standard app" aesthetic by embracing a high-end editorial layout. This is achieved through intentional asymmetry, generous white space (breathing room), and a "depth-first" philosophy. By utilizing glassmorphism and multi-layered surfaces, we create a tactile experience that feels as soft as it is sophisticated.

## 2. Colors & Surface Philosophy
The color palette is anchored in a vibrant, trustworthy purple and supported by a spectrum of soft, calming lavenders.

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Visual boundaries must be defined through background color shifts or tonal transitions. Use `surface-container-low` sections against a `surface` background to define content zones without creating "visual noise" through rigid lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of frosted glass layers.
- **Base Layer:** `surface` (#fff3ff).
- **Secondary Tier:** `surface-container` (#f3e3f6) for grouping major content areas.
- **Interactive Tier:** `surface-container-lowest` (#ffffff) for primary cards to create a "lifted" effect.

### The "Glass & Gradient" Rule
Floating elements (such as navigation bars or modal headers) should utilize Glassmorphism. 
- **Effect:** Apply `backdrop-blur` (20px to 40px) with a semi-transparent `surface_container_lowest` at 70% opacity.
- **Signature Textures:** For high-impact areas like hero banners or primary Action Buttons, use a subtle linear gradient transitioning from `primary` (#751fe7) to `primary_container` (#b58bff) at a 135-degree angle. This adds "soul" and depth that flat color cannot provide.

---

## 3. Typography
We use **Plus Jakarta Sans** as our sole typeface. Its geometric yet friendly curves perfectly bridge the gap between "playful" and "professional."

- **Display Scales (LG/MD/SM):** Reserved for high-impact editorial moments, such as progress milestones or welcome screens. Use `on_surface` with a tracking of -0.02em for a tighter, premium feel.
- **Headline & Title Scales:** Used to anchor sections. These provide the "Trustworthy" voice. Always prioritize `headline-md` for screen titles to ensure immediate hierarchy.
- **Body Scales:** `body-lg` is the workhorse for parent education. Maintain a line-height of 1.5x to ensure readability during stressful late-night health checks.
- **Labels:** Use `label-md` for metadata, rendered in `on_surface_variant` (#625865) to create a clear visual distinction from primary content.

---

## 4. Elevation & Depth
In this system, elevation is a feeling, not just a drop shadow.

### Tonal Layering
Instead of traditional shadows, achieve depth by "stacking." A `surface-container-lowest` card placed atop a `surface-container-low` background creates a natural, soft lift.

### Ambient Shadows
When a component must float (e.g., a FAB or a critical alert), use **Ambient Shadows**:
- **Color:** Use a tinted version of `on_surface` (e.g., #342c38 at 6% opacity).
- **Blur:** Large, diffused values (e.g., `blur: 32px`, `y: 8px`). Avoid dark grey, "dirty" shadows.

### The "Ghost Border" Fallback
If accessibility requires a container edge, use a **Ghost Border**. Apply the `outline_variant` (#b5a9b8) at 15% opacity. This provides a structural hint without breaking the soft aesthetic.

---

## 5. Components

### Buttons
- **Primary:** High-pill shape (`rounded-full`), using the signature gradient. Bold, rounded, and inviting.
- **Secondary:** `surface-container-highest` background with `on_primary_container` text. No border.
- **Tertiary:** Text-only using `primary` color, reserved for low-priority actions like "Cancel" or "Learn More."

### Cards (The "Frosted" Standard)
Cards are the heart of the experience. 
- **Style:** Background `surface-container-lowest` at 80% opacity with a `backdrop-blur`. 
- **Corner Radius:** Use `xl` (3rem) for large dashboard cards and `lg` (2rem) for standard feed items.
- **Spacing:** Minimum padding of `6` (2rem) to ensure content never feels cramped.

### Input Fields
- **Container:** `surface-container-low` with a `md` (1.5rem) corner radius. 
- **States:** On focus, transition the background to `surface-container-lowest` and apply a 2px Ghost Border using the `primary` token at 30% opacity.

### Selection Controls
- **Checkboxes & Radios:** Always use the `full` roundedness scale. The selected state should use the vibrant `primary` fill to signal a clear, confident choice.

---

## 6. Do's and Don'ts

### Do
- **Do** use white space as a functional tool. Use the `spacing-10` or `spacing-12` tokens between major sections to let the design breathe.
- **Do** use overlapping elements. A glass card slightly overlapping a background illustration creates high-end editorial depth.
- **Do** prioritize the `rounded-lg` and `rounded-xl` scales for all containers to reinforce the "LittleSteps" friendly tone.

### Don't
- **Don't** use 100% black text. Use `on_surface` (#342c38) to keep the contrast high but the "vibe" soft.
- **Don't** use sharp corners. Nothing in a pediatric environment should feel "sharp."
- **Don't** use dividers or horizontal rules. Use vertical spacing (`spacing-4` or `spacing-6`) or a subtle shift from `surface` to `surface-container` to separate items in a list.
- **Don't** over-saturate. While the `primary` purple is vibrant, it should be used as a surgical strike—for buttons and active states—while the rest of the UI remains in the calming lavender and white "glass" realm.