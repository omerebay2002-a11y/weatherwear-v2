---
name: WeatherWear
description: AI wardrobe assistant — tells you what to wear today, based on your closet and the weather.
colors:
  morning-linen: "#F5EFE6"
  morning-linen-light: "#FAF6EE"
  morning-linen-dark: "#E8DDC9"
  deep-walnut-ink: "#1A1410"
  deep-walnut-soft: "#2C2218"
  deep-walnut-muted: "#4A3829"
  worn-chestnut: "#5C3E22"
  aged-brass: "#B8956A"
  aged-brass-light: "#D9B47C"
  aged-brass-deep: "#8C6B42"
  dusty-sage: "#9BAE94"
  dusty-sage-deep: "#647B62"
typography:
  display:
    fontFamily: "Frank Ruhl Libre, Georgia, serif"
    fontSize: "clamp(1.75rem, 5vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Heebo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Heebo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.24em"
  editorial:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-brass:
    backgroundColor: "{colors.aged-brass}"
    textColor: "{colors.deep-walnut-ink}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-brass-hover:
    backgroundColor: "{colors.aged-brass-light}"
    textColor: "{colors.deep-walnut-ink}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.worn-chestnut}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  card:
    backgroundColor: "{colors.morning-linen-light}"
    rounded: "{rounded.sm}"
    padding: "16px"
  card-dark:
    backgroundColor: "{colors.deep-walnut-soft}"
    textColor: "{colors.morning-linen}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: WeatherWear

## 1. Overview

**Creative North Star: "The Trusted Dresser"**

WeatherWear is designed to feel like the piece of furniture that holds your whole wardrobe story: warm, intimate, present every morning without demanding attention. It doesn't try to impress. It knows what you have and tells you what to wear. The interface carries that same quiet authority — open it, see the answer, leave.

The system uses a Restrained color strategy: warm linen neutrals (Morning Linen) cover most surfaces, with a single Aged Brass accent appearing sparingly on hardware, primary actions, and selection states. The photographic walnut-wardrobe room — with the user's avatar composited standing in it — is the visual hero; everything in the 2D UI is designed not to compete with it. Shadows are tinted warm brown — the room has a temperature, and the interface lives inside it.

This is explicitly not a shopping catalog, not an aspirational feed, not a generic AI chatbot. No buy buttons. No OOTD imagery of models. No pulsing gradient "try AI" CTAs. The typographic pairing (Frank Ruhl Libre serif headlines with Heebo body) signals substance and clarity, not luxury marketing. Where the stylist speaks, she speaks in Cormorant Garamond italic — a voice different enough from the UI to feel human.

**Key Characteristics:**
- Near-monochrome warm surface: parchment from lightest to darkest, with brass as the one accent
- Serif headlines that read like a handwritten label on a drawer; sans body that disappears
- Shadows tinted warm brown, never grey — everything sits in the same warm room
- 4px radius on all containers: restrained geometry that echoes the cabinet's lines
- Frosted glass appears only on panels floating over the room scene, never as decoration

## 2. Colors: The Linen-and-Brass Palette

A warm near-monochrome palette. Most screens are 90% linen and walnut ink. Brass appears on at most 10% of any surface — its rarity is its meaning.

### Primary
- **Worn Chestnut** (#5C3E22): The primary content color for interactive elements below CTA level — active tab indicators, text links, mid-weight labels. Never used as a background.

### Secondary
- **Aged Brass** (#B8956A): The single decorative accent. Used on primary CTA buttons (the brass-plate component), active selection rings, and hardware metaphors in the room scene.
- **Aged Brass Light** (#D9B47C): Hover state for brass elements; also the text selection highlight color in the global stylesheet.
- **Aged Brass Deep** (#8C6B42): Pressed states and deep shadows on brass-plate elements.

### Tertiary
- **Dusty Sage** (#9BAE94): The one chromatic departure from the warm brown spectrum. Used for the bench cushion in the room scene and as a background tint for drawer-type compartment tags. Never used on body text.
- **Dusty Sage Deep** (#647B62): Active state and contrast variant for sage contexts.

### Neutral
- **Morning Linen** (#F5EFE6): The page background. Warm cream with a visible amber undertone.
- **Morning Linen Light** (#FAF6EE): Card surface — creates gentle tonal lift above the page without a hard edge.
- **Morning Linen Dark** (#E8DDC9): Dividers, borders, subtle separation lines. Used instead of grey.
- **Deep Walnut Ink** (#1A1410): All body text, icon fills, dark surfaces. Near-black with visible brown warmth.
- **Deep Walnut Soft** (#2C2218): Dark panel backgrounds — frost-dark overlays and bottom sheets in low-light contexts.
- **Deep Walnut Muted** (#4A3829): Secondary body text, placeholder text, disabled states.

### Named Rules
**The One Brass Rule.** Aged Brass (#B8956A) appears on at most 10% of any screen's surface. Its scarcity is what makes it read as hardware on the cabinet, not as a brand color. If you want to use it as a link color or section background, use Worn Chestnut instead.

**The No-Grey Rule.** Every shadow and border in this system carries warm brown. The shadow standard is `rgba(60, 40, 20, ...)` — not `rgba(0, 0, 0, ...)`. A cool-grey shadow on this palette looks like a bug.

## 3. Typography

**Display Font:** Frank Ruhl Libre (Georgia, serif)
**Body Font:** Heebo (system-ui, sans-serif)
**Editorial Font:** Cormorant Garamond (Georgia, serif) — italic, stylist voice only

**Character:** Frank Ruhl Libre's slightly pressured serif reads like a handwritten label on a drawer — confident, material, not decorative. Heebo's humanist sans keeps body copy legible in Hebrew and Latin at small mobile sizes. Cormorant Garamond italic is reserved for the AI stylist's voice in the chat panel — spoken, not printed.

### Hierarchy
- **Display** (Frank Ruhl Libre 500, clamp(1.75rem, 5vw, 2.5rem), line-height 1.1, tracking −0.012em): Section titles, the room header. Always Frank Ruhl Libre.
- **Headline** (Frank Ruhl Libre 500, 1.25rem, line-height 1.2, tracking −0.01em): Compartment headings, bottom sheet titles.
- **Title** (Heebo 600, 1rem, line-height 1.3): Item names, weather primary reading.
- **Body** (Heebo 400, 1rem, line-height 1.55): All body text, list content. Maximum line length 65ch.
- **Label** (Heebo 500, 0.6875rem, letter-spacing 0.24em, UPPERCASE): Category chips, eyebrow labels, section markers. Never used for full sentences.
- **Editorial** (Cormorant Garamond 400 italic, 1.0625rem, line-height 1.6): AI stylist chat responses only.

### Named Rules
**The Voice Rule.** Frank Ruhl Libre is the app speaking. Cormorant Garamond italic is the stylist speaking. Never mix them on one element, and never use Cormorant Garamond for navigation, labels, or error states.

## 4. Elevation

Elevation is warm and low. Shadows suggest that surfaces sit in a lit room, not on a white table. The photographic room with the composited avatar is the hero; 2D surfaces never compete through dramatic depth. Glassmorphism appears only when a panel genuinely floats over the room scene — functional, not aesthetic.

### Shadow Vocabulary
- **Resting Card** (`0 4px 14px -8px rgba(60, 40, 20, 0.2)`): Base card elevation. Warm brown, very soft. Used on all `.card` components at rest.
- **Ambient Soft** (`0 4px 20px -8px rgba(60, 40, 20, 0.25)`): Slightly lifted elements — focused inputs, hovered cards.
- **Ambient Large** (`0 12px 32px -12px rgba(60, 40, 20, 0.3)`): Bottom sheets and drawers pulled up from the screen edge.
- **Brass Ring** (`0 0 0 1px rgba(184, 149, 106, 0.4), 0 4px 16px -6px rgba(184, 149, 106, 0.35)`): Selected state ring for item cards and active compartment tabs. Glows warm, not neutral.
- **Frosted Panel** (`0 6px 20px -8px rgba(40, 20, 10, 0.25)` + `backdrop-filter: blur(14px) saturate(140%)`): Floating sheets over the room scene. The `.frost` component. Purposeful glassmorphism only.

### Named Rules
**The Warm Shadow Rule.** All shadows use `rgba(60, 40, 20, ...)`. A cold shadow on Morning Linen looks like a CSS error, not a design choice.

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only in response to state (focused, hovered, pulled up). Layout regions have no shadow.

## 5. Components

### Buttons
The primary button is a brass plate: a gradient engraved surface that echoes the cabinet hardware. It carries weight. It does not look like a SaaS button.

- **Shape:** 4px radius (almost sharp)
- **Brass Primary:** `linear-gradient(135deg, #E8C896 0%, #D9B47C 30%, #B8956A 60%, #8C6B42 100%)`, Deep Walnut Ink text, inset highlight `rgba(255,240,210,0.7)` top, inset shadow `rgba(60,40,20,0.4)` bottom. Padding: 14px 24px.
- **Hover:** Shifts toward Aged Brass Light; `transform: scale(1.01)` with 120ms `cubic-bezier(0.2, 0, 0, 1)`.
- **Ghost:** Transparent background, `1px solid rgba(184,149,106,0.5)` border, Worn Chestnut text. Used for secondary actions only.
- **FAB:** 56px circle, brass-plate gradient, Deep Walnut Ink icon, fixed bottom-left with safe-area-inset-bottom.

### Category Chips
Used to label compartment types (shirts, coats, drawers, shelves).

- **Default:** Morning Linen Dark background, Deep Walnut Muted text, 4px radius, label-tracked typography.
- **Active:** 1px Aged Brass border ring, Worn Chestnut text, Ambient Soft shadow.

### Cards
Wardrobe item cards. Flat by default — their only depth is the resting warm shadow and a thin brass-tinted border.

- **Corner Style:** 4px
- **Background:** Morning Linen Light (#FAF6EE)
- **Shadow:** Resting Card
- **Border:** `1px solid rgba(184, 149, 106, 0.25)`
- **Internal Padding:** 16px
- **Selected:** Brass Ring shadow replaces resting shadow; 1px Aged Brass border.

### Frost Overlay (Compartment Sheets)
A frosted bottom sheet that slides over the room scene to show compartment contents.

- **Light Frost:** `rgba(245, 239, 230, 0.78)`, `blur(14px) saturate(140%)`, `1px solid rgba(255,255,255,0.5)` border.
- **Dark Frost:** `rgba(26, 20, 16, 0.72)`, `blur(14px) saturate(140%)`, `1px solid rgba(184,149,106,0.3)` border. Used for the close button and dark contextual overlays.
- Never use frost on static layout elements. If it doesn't float over the room scene, use a solid surface.

### Tracked Labels
Uppercase eyebrow labels for category classification and metadata.

- **Font:** Heebo 500, 0.6875rem, letter-spacing 0.24em, `font-feature-settings: "tnum"`, UPPERCASE.
- **Default color:** Deep Walnut Muted. Active context: Aged Brass Deep.
- Maximum 3 words. Never a full sentence.

### Navigation (Bottom Tab Bar)
Two-tab navigation (Wardrobe / Today).

- **Background:** Morning Linen, `1px solid` Morning Linen Dark on top edge.
- **Active Tab:** Worn Chestnut text, weight shift only — no underline stripe, no indicator bar.
- **Inactive Tab:** Deep Walnut Muted.
- **Height:** 70px + safe-area-inset-bottom.

## 6. Avatar & Room Scene

The wardrobe page is one warm room, shown as a **portrait (9:16) photographic scene** that fills the phone. The walnut wardrobe sits on the **left** with breathing room from the wall; a clean **standing lane opens on the right** for the avatar. This scene is the product's hero — the user sees herself, in her room, wearing her clothes.

### The Room
- **Format:** portrait 9:16, fills the screen height; centered so a little crops off each edge on narrow phones while keeping both the wardrobe and the standing lane in view (`object-cover object-center`).
- **Composition:** wardrobe left-of-center, inset from the wall (never flush to the frame edge); generous open floor-and-wall standing lane on the right, also with a margin from the right wall. Nothing touches the frame edges.
- **Open/close:** a smooth opacity **cross-fade** between the closed scene and the open scene. The wardrobe opens **asymmetrically** (doors do not mirror) within its own footprint, revealing hanging rail + folded shelves + an open drawer. Opening must **never** make the avatar disappear — the open scene includes the figure too.
- **Source images:** `public/wardrobe-closed.png` + `public/wardrobe-interior.png`. Generated via the AI image pipeline; never a flat SVG/cartoon.

### The Avatar (figure)
- **Default:** a faceless, lifelike figure chosen by the onboarding `wardrobeFor` (woman / man / mixed→woman). Realistic human proportions and skin — closer to a person than a plastic mannequin.
- **Personalized:** once the user adds a selfie, a realistic full-body **"you"** (her real face, and aspirationally a body matching her real measurements) replaces the default. This is the whole point — it must feel like *her*.
- **Integration — "present, not pasted":** the figure is **composited into the room scene** with the room's own warm light and a natural cast shadow grounding it on the rug. A cut-out figure dropped on top with a different light temperature reads as a sticker and is wrong. When compositing isn't available, at minimum warm-grade the figure to the room and cast a soft directional shadow (light comes from the upper-left window).
- **Scale & placement:** full body, head-to-toe with feet resting on the rug; sized in natural proportion to the wardrobe (a real person's height beside it), never so large it dominates or so small it looks lost. Stands in the right lane, never overlapping the wardrobe.

### Named Rules
**The Present-Not-Pasted Rule.** The avatar must look like it is standing in the room — matched light, contact shadow, grounded feet. If it looks cut-and-pasted, it's wrong.

**The Her-Not-A-Stranger Rule.** The personalized avatar carries the user's real identity (face now, body via measurements later). The default faceless figure is a placeholder until her selfie arrives — not the destination.

## 7. Do's and Don'ts

### Do:
- **Do** use Aged Brass on primary buttons, active states, and hardware metaphors. Keep it below 10% of any screen's surface.
- **Do** tint every shadow with `rgba(60, 40, 20, ...)`. All shadows are warm.
- **Do** use Frank Ruhl Libre for all headings and section titles.
- **Do** use tracked uppercase (letter-spacing: 0.24em) for category labels and eyebrow text.
- **Do** keep border-radius at 4px for all containers — 8px or 9999px only for FABs and pill controls.
- **Do** respect `prefers-reduced-motion` and disable transitions when set.
- **Do** let the photographic room + composited avatar be the visual hero; keep 2D surfaces quiet.
- **Do** composite the avatar into the room with matched warm light and a grounding shadow — it must look present, not pasted.
- **Do** keep the avatar in natural human proportion to the wardrobe, standing in the right lane, feet on the rug.

### Don't:
- **Don't** add buy buttons, pricing, or catalog patterns. WeatherWear is not Stitch Fix or Rent the Runway. If it feels like a shopping app, it's wrong.
- **Don't** create inspirational image feeds, OOTD grids, or Pinterest-style scroll layouts. The user's own clothes are the only visual content.
- **Don't** use cold grey shadows (`rgba(0,0,0,...)`). Every shadow carries warm brown.
- **Don't** use Cormorant Garamond italic for UI copy, labels, or navigation. It belongs to the stylist's voice only.
- **Don't** apply frosted glass to static layout surfaces. Frost is functional, not decorative.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use Worn Chestnut or Aged Brass Deep as a solid accent color.
- **Don't** round containers beyond 4px. The cabinet's geometry is almost sharp, and the 2D UI should match it.
- **Don't** add `border-left` stripes as accent markers on list items. Use background tints or leading labels instead.
- **Don't** drop the avatar in as a flat cut-out with studio lighting on the warm room — mismatched light reads as a sticker.
- **Don't** let opening the wardrobe make the avatar vanish; the open scene includes the figure.
- **Don't** use a plastic, cartoonish mannequin for the personalized avatar — it must read as a real person (it's *her*).
