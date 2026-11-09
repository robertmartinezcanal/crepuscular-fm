# Design Brief

## Direction

Crepúsculo — a nocturnal community-radio identity where the dial glows amber against a warm Venezuelan dusk, built for Radio Crepuscular 99.5 FM.

## Tone

Warm nocturnal editorial — deep charcoal and ember amber instead of the cold blue tech-dark cliché, so the station feels like a lit window at dusk.

## Differentiation

A living "on-air" signal language: pulsing ember indicators, animated equalizer bars, and monospaced frequency readouts that make tuning in feel physical.

## Color Palette

| Token      | OKLCH       | Role                                  |
| ---------- | ----------- | ------------------------------------- |
| background | 0.15 0.016 52 | Warm dark charcoal page canvas       |
| foreground | 0.93 0.012 65 | Warm off-white body text             |
| card       | 0.19 0.019 52 | Elevated panels and program cards    |
| primary    | 0.76 0.16 68  | Ember amber — play button, CTAs      |
| accent     | 0.62 0.15 26  | Dusty coral — secondary highlights   |
| muted      | 0.23 0.021 52 | Quiet zones, dividers, inactive tabs |
| success    | 0.72 0.17 150 | Live-stream connected signal         |

## Typography

- Display: Space Grotesk — headings, program names, the frequency numeral
- Body: DM Sans — paragraphs, descriptions, UI labels
- Mono: Geist Mono — frequency, schedule times, live badges
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-4xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase font-mono`, body `text-base md:text-lg`

## Elevation & Depth

Layered warm surfaces (background → card → popover) with a soft `shadow-elevated` for the player and `shadow-subtle` for cards; depth comes from surface steps, not borders alone.

## Structural Zones

| Zone    | Background          | Border      | Notes                                        |
| ------- | ------------------- | ----------- | -------------------------------------------- |
| Header  | `bg-card`           | `border-b`  | Sticky, holds frequency + live status chip   |
| Content | `bg-background`     | —           | Alternate `bg-muted/30` between sections     |
| Player  | `bg-card` + shadow  | `border-t`  | Persistent docked bar, always reachable      |
| Footer  | `bg-muted/40`       | `border-t`  | Station identity, contact, TikTok link       |

## Spacing & Rhythm

Generous section gaps (`py-16 md:py-24`), content grouped in `gap-6` grids, micro-spacing `gap-2`/`gap-3` inside cards; program rows use tight vertical rhythm to read like a schedule.

## Component Patterns

- Buttons: pill primary with `bg-gradient-primary` and ember glow on hover; ghost secondary with `border-border`
- Cards: `rounded-lg` warm `bg-card`, `shadow-subtle`, hover lifts to `shadow-elevated` + `border-primary/40`
- Badges: full-round mono pills; live = `bg-success/15 text-success` with pulsing dot, time = `bg-muted text-muted-foreground`

## Motion

- Entrance: `animate-fade-in` staggered on section content, 0.5s ease-out
- Hover: `transition-smooth` lift on cards and buttons, 0.3s
- Decorative: `animate-signal-pulse` on live dot, `animate-equalizer` bars on the active player

## Constraints

- Spanish-language interface throughout; all copy in es-VE tone
- Dark mode is the primary identity; light mode is a warm daylight variant
- Semantic tokens only — no raw hex/rgb or arbitrary color classes in components
- No on-demand podcasts, recorded-program playback, or live song requests

## Signature Detail

The amber "on-air" signal system — a pulsing ember dot paired with animated equalizer bars and a monospaced 99.5 FM readout — turns stream status into the app's most recognizable motif.
